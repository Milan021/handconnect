-- ============================================================
-- HandConnect — Migration 009
-- Phase 7 : Notifications in-app + Coaching / Mentorat
-- ============================================================

-- ───────────────────────────────────────────────────
-- 1) Notifications in-app
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('job_match','application_status','message','placement','mentorship','system')),
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB DEFAULT '{}',
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_own" ON notifications;
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- ───────────────────────────────────────────────────
-- 2) Coaching / Mentorat — anciens handballeurs mentors
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mentors (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active       BOOLEAN DEFAULT TRUE,
  expertise       TEXT[],       -- {reconversion,securite,btp,coaching,entrepreneuriat...}
  bio             TEXT,
  availability    TEXT,         -- "2h/semaine", "sur demande", etc.
  max_mentees     INTEGER DEFAULT 3,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentors_profile ON mentors(profile_id);
CREATE INDEX IF NOT EXISTS idx_mentors_active  ON mentors(is_active) WHERE is_active = TRUE;

ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentors_select_public" ON mentors;
DROP POLICY IF EXISTS "mentors_insert_owner"  ON mentors;
DROP POLICY IF EXISTS "mentors_update_owner"  ON mentors;

CREATE POLICY "mentors_select_public" ON mentors FOR SELECT USING (true);
CREATE POLICY "mentors_insert_owner"  ON mentors FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "mentors_update_owner"  ON mentors FOR UPDATE USING (auth.uid() = profile_id);

-- ───────────────────────────────────────────────────
-- 3) Demandes de mentorat
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mentorship_requests (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id   UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  mentee_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','completed')),
  message     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (mentor_id, mentee_id)
);

CREATE INDEX IF NOT EXISTS idx_mentorships_mentor ON mentorship_requests(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentee ON mentorship_requests(mentee_id);

ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentorship_select_mentor" ON mentorship_requests;
DROP POLICY IF EXISTS "mentorship_select_mentee" ON mentorship_requests;
DROP POLICY IF EXISTS "mentorship_insert_mentee" ON mentorship_requests;

CREATE POLICY "mentorship_select_mentor" ON mentorship_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM mentors m WHERE m.id = mentorship_requests.mentor_id AND m.profile_id = auth.uid())
);
CREATE POLICY "mentorship_select_mentee" ON mentorship_requests FOR SELECT USING (auth.uid() = mentee_id);
CREATE POLICY "mentorship_insert_mentee" ON mentorship_requests FOR INSERT WITH CHECK (auth.uid() = mentee_id);

-- ───────────────────────────────────────────────────
-- 4) Trigger : notification automatique sur événements
-- ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_data JSONB DEFAULT '{}'
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  notif_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id INTO notif_id;
  RETURN notif_id;
END;
$$;

-- Notification quand un candidat postule
CREATE OR REPLACE FUNCTION on_application_notify_recruiter() RETURNS TRIGGER AS $$
DECLARE
  job_record RECORD;
  recruiter_id UUID;
BEGIN
  SELECT j.author_id, j.company_id, j.title INTO job_record
  FROM jobs j WHERE j.id = NEW.job_id;

  -- Si entreprise liée, notifier le owner
  IF job_record.company_id IS NOT NULL THEN
    SELECT c.owner_id INTO recruiter_id FROM companies c WHERE c.id = job_record.company_id;
  ELSE
    recruiter_id := job_record.author_id;
  END IF;

  IF recruiter_id IS NOT NULL THEN
    PERFORM create_notification(
      recruiter_id,
      'application_status',
      'Nouvelle candidature',
      'Un candidat a postulé à votre offre "' || job_record.title || '"',
      jsonb_build_object('job_id', NEW.job_id, 'application_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_application_notify ON job_applications;
CREATE TRIGGER trg_application_notify
  AFTER INSERT ON job_applications
  FOR EACH ROW EXECUTE FUNCTION on_application_notify_recruiter();

-- Notification quand le statut d'une candidature change
CREATE OR REPLACE FUNCTION on_application_status_change_notify() RETURNS TRIGGER AS $$
DECLARE
  job_title TEXT;
BEGIN
  SELECT j.title INTO job_title FROM jobs j WHERE j.id = NEW.job_id;

  IF NEW.status = 'accepted' THEN
    PERFORM create_notification(
      NEW.applicant_id,
      'application_status',
      'Candidature acceptée',
      'Votre candidature pour "' || job_title || '" a été acceptée !',
      jsonb_build_object('job_id', NEW.job_id, 'application_id', NEW.id, 'status', NEW.status)
    );
  ELSIF NEW.status = 'rejected' THEN
    PERFORM create_notification(
      NEW.applicant_id,
      'application_status',
      'Candidature refusée',
      'Votre candidature pour "' || job_title || '" n''a pas été retenue.',
      jsonb_build_object('job_id', NEW.job_id, 'application_id', NEW.id, 'status', NEW.status)
    );
  ELSIF NEW.status = 'interview' THEN
    PERFORM create_notification(
      NEW.applicant_id,
      'application_status',
      'Entretien proposé',
      'Un entretien vous est proposé pour "' || job_title || '"',
      jsonb_build_object('job_id', NEW.job_id, 'application_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_application_status_notify ON job_applications;
CREATE TRIGGER trg_application_status_notify
  AFTER UPDATE OF status ON job_applications
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION on_application_status_change_notify();

-- Notification quand une demande de mentorat est acceptée
CREATE OR REPLACE FUNCTION on_mentorship_accepted_notify() RETURNS TRIGGER AS $$
DECLARE
  mentor_profile_id UUID;
BEGIN
  IF NEW.status = 'accepted' THEN
    SELECT m.profile_id INTO mentor_profile_id FROM mentors m WHERE m.id = NEW.mentor_id;
    -- Notifier le mentee
    PERFORM create_notification(
      NEW.mentee_id,
      'mentorship',
      'Mentorat accepté',
      'Votre demande de mentorat a été acceptée !',
      jsonb_build_object('mentor_id', NEW.mentor_id, 'mentorship_id', NEW.id)
    );
    -- Notifier le mentor
    PERFORM create_notification(
      mentor_profile_id,
      'mentorship',
      'Nouveau mentorat',
      'Vous avez accepté une nouvelle demande de mentorat.',
      jsonb_build_object('mentee_id', NEW.mentee_id, 'mentorship_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mentorship_notify ON mentorship_requests;
CREATE TRIGGER trg_mentorship_notify
  AFTER UPDATE OF status ON mentorship_requests
  FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'accepted')
  EXECUTE FUNCTION on_mentorship_accepted_notify();
