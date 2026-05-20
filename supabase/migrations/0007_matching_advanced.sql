-- ============================================================
-- HandConnect — Migration 007
-- Système de matching avancé + recherches sauvegardées + alertes
-- ============================================================

-- ───────────────────────────────────────────────────
-- 1) Recherches sauvegardées (joueurs)
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_searches (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  filters     JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_searches_own" ON saved_searches;
CREATE POLICY "saved_searches_own" ON saved_searches
  FOR ALL USING (auth.uid() = user_id);

-- ───────────────────────────────────────────────────
-- 2) Alertes — notifications quand nouvelle offre correspond
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_alerts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  saved_search_id UUID REFERENCES saved_searches(id) ON DELETE CASCADE,
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_alerts_user ON job_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_unread ON job_alerts(user_id, is_read) WHERE is_read = FALSE;

ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "job_alerts_own" ON job_alerts;
CREATE POLICY "job_alerts_own" ON job_alerts
  FOR ALL USING (auth.uid() = user_id);

-- ───────────────────────────────────────────────────
-- 3) RPC : matching amélioré avec tous les critères
-- ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION match_jobs_for_profile(profile_id UUID, max_results INTEGER DEFAULT 20)
RETURNS TABLE (
  job_id UUID,
  title TEXT,
  company_name TEXT,
  city TEXT,
  sector TEXT,
  contract_type TEXT,
  handball_compatible BOOLEAN,
  match_score INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  prof_sectors TEXT[];
  prof_city TEXT;
  prof_skills TEXT[];
  prof_availability DATE;
  prof_contract_prefs TEXT[];
BEGIN
  SELECT desired_sectors, city, athlete_skills, availability_date
    INTO prof_sectors, prof_city, prof_skills, prof_availability
    FROM profiles WHERE id = profile_id;

  RETURN QUERY
    SELECT
      j.id AS job_id,
      j.title,
      COALESCE(c.name, j.company) AS company_name,
      j.city,
      j.sector,
      j.contract_type,
      j.handball_compatible,
      (
        CASE WHEN prof_sectors IS NOT NULL AND j.sector = ANY(prof_sectors) THEN 40 ELSE 0 END +
        CASE WHEN prof_city IS NOT NULL AND j.city ILIKE '%' || prof_city || '%' THEN 30 ELSE 0 END +
        CASE WHEN j.handball_compatible THEN 20 ELSE 0 END +
        CASE WHEN j.job_type = 'reconversion' THEN 10 ELSE 0 END
      )::INTEGER AS match_score
    FROM jobs j
    LEFT JOIN companies c ON c.id = j.company_id
    WHERE j.is_active = TRUE
      AND j.job_type = 'reconversion'
      AND (prof_availability IS NULL OR j.created_at >= prof_availability - INTERVAL '6 months')
    ORDER BY match_score DESC, j.created_at DESC
    LIMIT max_results;
END;
$$;

-- ───────────────────────────────────────────────────
-- 4) RPC : générer des alertes pour un utilisateur
--    (à appeler via cron ou trigger)
-- ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_job_alerts_for_user(user_uuid UUID)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  inserted_count INTEGER := 0;
BEGIN
  -- Pour chaque recherche sauvegardée de l'utilisateur,
  -- trouver les offres récentes non vues et créer des alertes
  INSERT INTO job_alerts (user_id, saved_search_id, job_id)
  SELECT
    ss.user_id,
    ss.id,
    j.job_id
  FROM saved_searches ss
  CROSS JOIN LATERAL (
    SELECT m.job_id FROM match_jobs_for_profile(ss.user_id, 50) m
    WHERE m.match_score >= 30
  ) j
  WHERE ss.user_id = user_uuid
    AND NOT EXISTS (
      SELECT 1 FROM job_alerts ja
      WHERE ja.user_id = ss.user_id AND ja.job_id = j.job_id
    );

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

-- ───────────────────────────────────────────────────
-- 5) Trigger : auto-générer alertes quand une nouvelle offre est créée
-- ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION on_new_job_create_alerts() RETURNS TRIGGER AS $$
DECLARE
  u RECORD;
BEGIN
  -- Pour chaque joueur pro qui cherche un emploi et a des recherches sauvegardées
  FOR u IN
    SELECT DISTINCT ss.user_id
    FROM saved_searches ss
    JOIN profiles p ON p.id = ss.user_id
    WHERE p.is_pro = TRUE AND p.searching_job = TRUE
  LOOP
    -- Si le job matche le profil (score >= 30), créer une alerte
    IF EXISTS (
      SELECT 1 FROM match_jobs_for_profile(u.user_id, 1) m
      WHERE m.job_id = NEW.id AND m.match_score >= 30
    ) THEN
      INSERT INTO job_alerts (user_id, job_id)
      VALUES (u.user_id, NEW.id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_new_job_alerts ON jobs;
CREATE TRIGGER trg_new_job_alerts
  AFTER INSERT ON jobs
  FOR EACH ROW
  WHEN (NEW.job_type = 'reconversion' AND NEW.is_active = TRUE)
  EXECUTE FUNCTION on_new_job_create_alerts();

-- ───────────────────────────────────────────────────
-- 6) Vue : offres avec score de matching (pour un profil donné)
-- ───────────────────────────────────────────────────
CREATE OR REPLACE VIEW job_matches AS
SELECT
  j.*,
  c.name AS company_name,
  c.size AS company_size,
  c.logo_url AS company_logo
FROM jobs j
LEFT JOIN companies c ON c.id = j.company_id
WHERE j.is_active = TRUE AND j.job_type = 'reconversion';
