-- ============================================================
-- HandConnect — Migration 008
-- Beta : inscriptions, feedback, métriques
-- ============================================================

-- ───────────────────────────────────────────────────
-- 1) Inscriptions beta
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS beta_signups (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('joueur','entreprise')),
  current_club    TEXT,
  current_league  TEXT,
  company_name    TEXT,
  company_sector  TEXT,
  message         TEXT,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','invited')),
  invited_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beta_signups_email ON beta_signups(email);
CREATE INDEX IF NOT EXISTS idx_beta_signups_type   ON beta_signups(type);
CREATE INDEX IF NOT EXISTS idx_beta_signups_status ON beta_signups(status);

ALTER TABLE beta_signups ENABLE ROW LEVEL SECURITY;

-- Seuls les admins (role = 'admin') peuvent voir les inscriptions
-- Les users non-connectés peuvent insérer (inscription publique)
DROP POLICY IF EXISTS "beta_signups_insert_public" ON beta_signups;
DROP POLICY IF EXISTS "beta_signups_select_admin"  ON beta_signups;

CREATE POLICY "beta_signups_insert_public" ON beta_signups FOR INSERT WITH CHECK (true);
CREATE POLICY "beta_signups_select_admin"  ON beta_signups FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- ───────────────────────────────────────────────────
-- 2) Feedback des utilisateurs beta
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS beta_feedback (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email       TEXT,
  type        TEXT NOT NULL CHECK (type IN ('bug','feature','ux','performance','other')),
  category    TEXT,                          -- matching, dashboard, chat, onboarding, etc.
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  message     TEXT NOT NULL,
  screenshot_url TEXT,
  resolved    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beta_feedback_user    ON beta_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_type    ON beta_feedback(type);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_created ON beta_feedback(created_at);

ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "beta_feedback_insert" ON beta_feedback;
DROP POLICY IF EXISTS "beta_feedback_own"    ON beta_feedback;
DROP POLICY IF EXISTS "beta_feedback_admin"  ON beta_feedback;

CREATE POLICY "beta_feedback_insert" ON beta_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "beta_feedback_own"    ON beta_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "beta_feedback_admin"  ON beta_feedback FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- ───────────────────────────────────────────────────
-- 3) Métriques automatiques (vue matérialisée ou table)
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS beta_metrics (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  total_signups   INTEGER DEFAULT 0,
  signups_joueurs INTEGER DEFAULT 0,
  signups_entreprises INTEGER DEFAULT 0,
  active_profiles INTEGER DEFAULT 0,
  active_companies INTEGER DEFAULT 0,
  jobs_posted     INTEGER DEFAULT 0,
  applications_sent INTEGER DEFAULT 0,
  placements      INTEGER DEFAULT 0,
  avg_match_score NUMERIC(5,2),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (metric_date)
);

-- ───────────────────────────────────────────────────
-- 4) Fonction : recalculer les métriques du jour
-- ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION recalculate_beta_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO beta_metrics (
    metric_date,
    total_signups,
    signups_joueurs,
    signups_entreprises,
    active_profiles,
    active_companies,
    jobs_posted,
    applications_sent,
    placements
  )
  SELECT
    target_date,
    (SELECT COUNT(*) FROM beta_signups WHERE created_at::date <= target_date),
    (SELECT COUNT(*) FROM beta_signups WHERE type = 'joueur' AND created_at::date <= target_date),
    (SELECT COUNT(*) FROM beta_signups WHERE type = 'entreprise' AND created_at::date <= target_date),
    (SELECT COUNT(*) FROM profiles WHERE is_pro = TRUE),
    (SELECT COUNT(*) FROM companies),
    (SELECT COUNT(*) FROM jobs WHERE job_type = 'reconversion' AND is_active = TRUE),
    (SELECT COUNT(*) FROM job_applications),
    (SELECT COUNT(*) FROM placements WHERE status = 'confirmed')
  ON CONFLICT (metric_date) DO UPDATE SET
    total_signups = EXCLUDED.total_signups,
    signups_joueurs = EXCLUDED.signups_joueurs,
    signups_entreprises = EXCLUDED.signups_entreprises,
    active_profiles = EXCLUDED.active_profiles,
    active_companies = EXCLUDED.active_companies,
    jobs_posted = EXCLUDED.jobs_posted,
    applications_sent = EXCLUDED.applications_sent,
    placements = EXCLUDED.placements,
    created_at = NOW();
END;
$$;

-- ───────────────────────────────────────────────────
-- 5) Colonne role sur profiles (si pas déjà fait)
-- ───────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user','admin','moderator'));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
