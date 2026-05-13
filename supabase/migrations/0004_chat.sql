-- ============================================================
-- HandConnect — Migration 004
-- Chat 1-1 avec demandes de connexion (à la LinkedIn)
--   - Une connexion accepted est obligatoire entre A et B avant de chatter.
--   - Une candidature à une annonce crée automatiquement une connexion accepted
--     entre le candidat et l'auteur de l'annonce.
--   - Les conversations sont strictement privées (RLS).
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- ───────────────────────────────────────────────────
-- 1) Connections (demandes de mise en relation)
--    Convention : participant_a < participant_b (ordre lexico des UUIDs)
--    pour qu'une paire n'apparaisse qu'une seule fois.
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS connections (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_a   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_b   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requester_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  responded_at    TIMESTAMPTZ,
  CONSTRAINT participants_ordered CHECK (participant_a < participant_b),
  CONSTRAINT participants_distinct CHECK (participant_a <> participant_b),
  CONSTRAINT requester_is_participant CHECK (requester_id IN (participant_a, participant_b)),
  UNIQUE (participant_a, participant_b)
);

CREATE INDEX IF NOT EXISTS idx_connections_a      ON connections(participant_a);
CREATE INDEX IF NOT EXISTS idx_connections_b      ON connections(participant_b);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- ───────────────────────────────────────────────────
-- 2) Conversations + Messages
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_a   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_b   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT conv_participants_ordered  CHECK (participant_a < participant_b),
  CONSTRAINT conv_participants_distinct CHECK (participant_a <> participant_b),
  UNIQUE (participant_a, participant_b)
);

CREATE INDEX IF NOT EXISTS idx_conversations_a        ON conversations(participant_a);
CREATE INDEX IF NOT EXISTS idx_conversations_b        ON conversations(participant_b);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON conversations(last_message_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body            TEXT NOT NULL CHECK (length(body) > 0 AND length(body) <= 2000),
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conv   ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id) WHERE read_at IS NULL;

-- ───────────────────────────────────────────────────
-- 3) Triggers
-- ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION bump_conversation_last_msg() RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bump_conv_last_msg ON messages;
CREATE TRIGGER trg_bump_conv_last_msg
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION bump_conversation_last_msg();

-- Trigger : une candidature crée automatiquement une connexion 'accepted'
CREATE OR REPLACE FUNCTION auto_connect_on_application() RETURNS TRIGGER AS $$
DECLARE
  author UUID;
  a UUID; b UUID;
BEGIN
  SELECT author_id INTO author FROM annonces WHERE id = NEW.annonce_id;
  IF author IS NULL OR author = NEW.applicant_id THEN
    RETURN NEW;
  END IF;
  IF NEW.applicant_id < author THEN a := NEW.applicant_id; b := author;
  ELSE                              a := author;           b := NEW.applicant_id;
  END IF;
  INSERT INTO connections (participant_a, participant_b, requester_id, status, responded_at)
    VALUES (a, b, NEW.applicant_id, 'accepted', NOW())
    ON CONFLICT (participant_a, participant_b) DO UPDATE
      SET status = 'accepted',
          responded_at = COALESCE(connections.responded_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_connect_on_application ON applications;
CREATE TRIGGER trg_auto_connect_on_application
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION auto_connect_on_application();

-- ───────────────────────────────────────────────────
-- 4) RPC : demander une connexion
-- ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION request_connection(other_user_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  uid UUID := auth.uid();
  a UUID; b UUID; conn_id UUID; existing_status TEXT;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF uid = other_user_id THEN RAISE EXCEPTION 'Cannot connect with yourself'; END IF;
  IF uid < other_user_id THEN a := uid; b := other_user_id;
  ELSE                       a := other_user_id; b := uid;
  END IF;
  SELECT id, status INTO conn_id, existing_status
    FROM connections WHERE participant_a = a AND participant_b = b;
  IF conn_id IS NOT NULL THEN
    -- Si refusé, on autorise une nouvelle tentative (repassage en pending par l'autre)
    IF existing_status = 'rejected' AND uid <> (SELECT requester_id FROM connections WHERE id = conn_id) THEN
      UPDATE connections
         SET status = 'pending', requester_id = uid, responded_at = NULL
       WHERE id = conn_id;
    END IF;
    RETURN conn_id;
  END IF;
  INSERT INTO connections (participant_a, participant_b, requester_id, status)
    VALUES (a, b, uid, 'pending') RETURNING id INTO conn_id;
  RETURN conn_id;
END;
$$;

-- ───────────────────────────────────────────────────
-- 5) RPC : récupérer ou créer une conversation (exige connexion accepted)
-- ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_or_create_conversation(other_user_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  uid UUID := auth.uid();
  a UUID; b UUID; conn_status TEXT; conv_id UUID;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF uid = other_user_id THEN RAISE EXCEPTION 'Cannot chat with yourself'; END IF;
  IF uid < other_user_id THEN a := uid; b := other_user_id;
  ELSE                       a := other_user_id; b := uid;
  END IF;
  SELECT status INTO conn_status
    FROM connections WHERE participant_a = a AND participant_b = b;
  IF conn_status IS NULL OR conn_status <> 'accepted' THEN
    RAISE EXCEPTION 'Connection not accepted';
  END IF;
  SELECT id INTO conv_id
    FROM conversations WHERE participant_a = a AND participant_b = b;
  IF conv_id IS NULL THEN
    INSERT INTO conversations (participant_a, participant_b)
      VALUES (a, b) RETURNING id INTO conv_id;
  END IF;
  RETURN conv_id;
END;
$$;

-- ───────────────────────────────────────────────────
-- 6) RLS
-- ───────────────────────────────────────────────────
ALTER TABLE connections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;

-- Connections
DROP POLICY IF EXISTS "participants_select_conn" ON connections;
DROP POLICY IF EXISTS "participants_update_conn" ON connections;

CREATE POLICY "participants_select_conn" ON connections
  FOR SELECT USING (auth.uid() IN (participant_a, participant_b));

-- Le destinataire d'une demande peut l'accepter ou la refuser
CREATE POLICY "participants_update_conn" ON connections
  FOR UPDATE USING (
    auth.uid() IN (participant_a, participant_b)
      AND auth.uid() <> requester_id
  );

-- Conversations
DROP POLICY IF EXISTS "participants_select_conv" ON conversations;
CREATE POLICY "participants_select_conv" ON conversations
  FOR SELECT USING (auth.uid() IN (participant_a, participant_b));

-- Messages : lire/écrire si on est participant
DROP POLICY IF EXISTS "participants_select_msg" ON messages;
DROP POLICY IF EXISTS "participants_insert_msg" ON messages;
DROP POLICY IF EXISTS "participants_update_msg" ON messages;

CREATE POLICY "participants_select_msg" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
       WHERE c.id = messages.conversation_id
         AND auth.uid() IN (c.participant_a, c.participant_b)
    )
  );

CREATE POLICY "participants_insert_msg" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND EXISTS (
      SELECT 1 FROM conversations c
       WHERE c.id = messages.conversation_id
         AND auth.uid() IN (c.participant_a, c.participant_b)
    )
  );

CREATE POLICY "participants_update_msg" ON messages
  FOR UPDATE USING (
    auth.uid() <> sender_id AND EXISTS (
      SELECT 1 FROM conversations c
       WHERE c.id = messages.conversation_id
         AND auth.uid() IN (c.participant_a, c.participant_b)
    )
  );

-- ───────────────────────────────────────────────────
-- 7) Realtime — publication
-- ───────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                  WHERE pubname='supabase_realtime' AND tablename='messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                  WHERE pubname='supabase_realtime' AND tablename='connections') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE connections;
  END IF;
END $$;
