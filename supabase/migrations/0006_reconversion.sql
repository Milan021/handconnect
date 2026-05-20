-- ============================================================
-- HandConnect — Migration 006
-- Pivot Reconversion : handballeurs pros × entreprises
--   - Profil reconversion sur les handballeurs
--   - Entreprises recruteuses
--   - Offres d'emploi dédiées reconversion
--   - Tracking des placements (commission)
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- ───────────────────────────────────────────────────
-- 1) Profils — champs reconversion pour handballeurs pros
-- ───────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_pro               BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS current_league       TEXT,           -- LNH, Proligue, D1F, D2F, D2M...
  ADD COLUMN IF NOT EXISTS contract_end_date    DATE,
  ADD COLUMN IF NOT EXISTS desired_sectors      TEXT[],         -- {logistique,securite,btp,sante...}
  ADD COLUMN IF NOT EXISTS athlete_skills       TEXT[],         -- {leadership,stress,travail_equipe...}
  ADD COLUMN IF NOT EXISTS availability_date    DATE,
  ADD COLUMN IF NOT EXISTS salary_expectation   TEXT,
  ADD COLUMN IF NOT EXISTS bio_reconversion     TEXT,
  ADD COLUMN IF NOT EXISTS professional_goals   TEXT,
  ADD COLUMN IF NOT EXISTS searching_job        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS languages            TEXT[] DEFAULT ARRAY['français'],
  ADD COLUMN IF NOT EXISTS certifications       TEXT[],
  ADD COLUMN IF NOT EXISTS linkedin_url         TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url        TEXT;

COMMENT ON COLUMN profiles.is_pro IS 'TRUE si le joueur est un handballeur professionnel';
COMMENT ON COLUMN profiles.current_league IS 'Championnat actuel : LNH, Proligue, D1F, D2F, Starligue...';
COMMENT ON COLUMN profiles.contract_end_date IS 'Date de fin de contrat sportif = date de disponibilité pro';
COMMENT ON COLUMN profiles.desired_sectors IS 'Secteurs d activité visés pour la reconversion';
COMMENT ON COLUMN profiles.athlete_skills IS 'Competences transférables identifiées (soft skills sportifs)';
COMMENT ON COLUMN profiles.searching_job IS 'TRUE = visible dans le catalogue des profils pour les entreprises';

CREATE INDEX IF NOT EXISTS idx_profiles_is_pro        ON profiles(is_pro) WHERE is_pro = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_searching_job   ON profiles(searching_job) WHERE searching_job = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_contract_end    ON profiles(contract_end_date);
CREATE INDEX IF NOT EXISTS idx_profiles_availability    ON profiles(availability_date);

-- ───────────────────────────────────────────────────
-- 2) Table entreprises (recruteurs)
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  sector          TEXT NOT NULL,                        -- btp, logistique, securite, sante...
  size            TEXT DEFAULT 'PME' CHECK (size IN ('TPE','PME','ETI','grand_groupe')),
  city            TEXT NOT NULL,
  region          TEXT,
  description     TEXT,
  why_athletes    TEXT,                                 -- Pourquoi recruter des anciens sportifs
  website         TEXT,
  logo_url        TEXT,
  contact_name    TEXT,
  contact_email   TEXT,
  contact_phone   TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  plan            TEXT DEFAULT 'free' CHECK (plan IN ('free','standard','premium')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_sector    ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_city      ON companies(city);
CREATE INDEX IF NOT EXISTS idx_companies_owner     ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_plan      ON companies(plan);

COMMENT ON TABLE companies IS 'Entreprises partenaires qui recrutent des handballeurs en reconversion';

-- ───────────────────────────────────────────────────
-- 3) Offres d emploi reconversion (enrichissement de la table jobs existante)
-- ───────────────────────────────────────────────────
-- La table jobs existe déjà (migration antérieure). On l'enrichit :
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS company_id       UUID REFERENCES companies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS job_type         TEXT DEFAULT 'reconversion' CHECK (job_type IN ('reconversion','classique')),
  ADD COLUMN IF NOT EXISTS sector           TEXT,
  ADD COLUMN IF NOT EXISTS athlete_profile  TEXT,         -- "Idéal : ancien sportif de haut niveau, leadership..."
  ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'debutant' CHECK (experience_level IN ('debutant','intermediaire','confirme')),
  ADD COLUMN IF NOT EXISTS remote_policy    TEXT DEFAULT 'non' CHECK (remote_policy IN ('non','partiel','total')),
  ADD COLUMN IF NOT EXISTS benefits         TEXT[],       -- {prime,logement,formation,horaires_flexibles...}
  ADD COLUMN IF NOT EXISTS views_count      INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS applications_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_rate  NUMERIC(4,3) DEFAULT 0.08;  -- 8% par défaut

COMMENT ON COLUMN jobs.company_id IS 'Référence vers la table companies (si offre reconversion)';
COMMENT ON COLUMN jobs.job_type IS 'reconversion = pour anciens handballeurs, classique = offre classique';
COMMENT ON COLUMN jobs.commission_rate IS 'Pourcentage de commission sur salaire annuel si placement';

CREATE INDEX IF NOT EXISTS idx_jobs_company_id   ON jobs(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_job_type     ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_sector       ON jobs(sector);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active    ON jobs(is_active);

-- ───────────────────────────────────────────────────
-- 4) Candidatures aux offres d emploi reconversion
--    (la table applications existe déjà pour les annonces clubs)
--    On crée une table dédiée pour les offres pro
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_applications (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id        UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message       TEXT,
  cv_url        TEXT,
  cv_filename   TEXT,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','seen','interview','accepted','rejected','withdrawn')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (job_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_job_applications_job        ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant  ON job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status     ON job_applications(status);

-- Trigger : auto-incrément applications_count sur jobs
CREATE OR REPLACE FUNCTION update_job_applications_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE jobs SET applications_count = COALESCE(applications_count, 0) + 1 WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE jobs SET applications_count = GREATEST(COALESCE(applications_count, 0) - 1, 0) WHERE id = OLD.job_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_job_applications_count ON job_applications;
CREATE TRIGGER trg_update_job_applications_count
  AFTER INSERT OR DELETE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_job_applications_count();

-- ───────────────────────────────────────────────────
-- 5) Placements (tracking des recrutements réussis)
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS placements (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id            UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  job_application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  applicant_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  placement_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  salary_brut_annuel NUMERIC(10,2),                       -- Pour calculer la commission
  commission_rate   NUMERIC(4,3) DEFAULT 0.08,
  commission_amount NUMERIC(10,2),                        -- Calculé automatiquement
  commission_paid   BOOLEAN DEFAULT FALSE,
  commission_paid_at TIMESTAMPTZ,
  status            TEXT DEFAULT 'confirmed' CHECK (status IN ('pending','confirmed','cancelled','paid')),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_placements_company     ON placements(company_id);
CREATE INDEX IF NOT EXISTS idx_placements_applicant   ON placements(applicant_id);
CREATE INDEX IF NOT EXISTS idx_placements_status      ON placements(status);
CREATE INDEX IF NOT EXISTS idx_placements_paid        ON placements(commission_paid);

COMMENT ON TABLE placements IS 'Tracking des placements réussis pour facturation des commissions';

-- Trigger : calcul auto commission
CREATE OR REPLACE FUNCTION calculate_placement_commission() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.salary_brut_annuel IS NOT NULL AND NEW.commission_rate IS NOT NULL THEN
    NEW.commission_amount := ROUND(NEW.salary_brut_annuel * NEW.commission_rate, 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calc_commission ON placements;
CREATE TRIGGER trg_calc_commission
  BEFORE INSERT OR UPDATE OF salary_brut_annuel, commission_rate ON placements
  FOR EACH ROW EXECUTE FUNCTION calculate_placement_commission();

-- ───────────────────────────────────────────────────
-- 6) Secteurs d activité (table de référence)
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sectors (
  id          TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#3B82F6',
  icon        TEXT DEFAULT '•',
  sort_order  INTEGER DEFAULT 0
);

INSERT INTO sectors (id, label, description, color, icon, sort_order) VALUES
  ('securite',    'Sécurité privée',     'Agent de sécurité, chef d équipe, sûreté',        '#DC2626', '🛡️', 1),
  ('logistique',  'Logistique & Transport', 'Responsable entrepôt, planificateur, conducteur', '#F59E0B', '📦', 2),
  ('btp',         'BTP & Travaux',       'Conducteur travaux, chef de chantier, gros œuvre', '#EA580C', '🏗️', 3),
  ('commerce',    'Commerce & Distribution', 'Responsable magasin, équipe, vente',             '#10B981', '🏪', 4),
  ('sante',       'Santé & Bien-être',   'Kiné, coach sportif, préparateur physique',        '#06B6D4', '❤️', 5),
  ('evenementiel','Événementiel',        'Chef de projet, opérations, organisation',         '#8B5CF6', '🎉', 6),
  ('informatique','Informatique & Digital', 'Support, cybersécurité, gestion de projet IT',    '#3B82F6', '💻', 7),
  ('industrie',   'Industrie',           'Production, qualité, maintenance',                  '#64748B', '🏭', 8),
  ('education',   'Éducation & Formation', 'Formateur, éducateur sportif, accompagnateur',    '#EC4899', '🎓', 9),
  ('autre',       'Autre secteur',       'Tous autres secteurs',                             '#6B7280', '🔹', 99)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────────
-- 7) Compétences transférables (table de référence)
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS athlete_skills (
  id          TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  description TEXT,
  category    TEXT DEFAULT 'general'
);

INSERT INTO athlete_skills (id, label, description, category) VALUES
  ('leadership',       'Leadership',           'Capacité à fédérer et entraîner une équipe',           'management'),
  ('travail_equipe',   'Travail d équipe',     'Collaboration efficace dans des environnements collectifs', 'social'),
  ('gestion_stress',   'Gestion du stress',    'Performance sous pression et dans l urgence',          'mental'),
  ('discipline',       'Discipline & rigueur', 'Respect des horaires, des consignes, des objectifs',   'mental'),
  ('perseverance',     'Persévérance',         'Capacité à rebondir après un échec',                   'mental'),
  ('organisation',     'Organisation',         'Planification, anticipation, gestion du temps',        'management'),
  ('communication',    'Communication',        'Expression claire, écoute active, négociation',        'social'),
  ('adaptabilite',     'Adaptabilité',         'Apprentissage rapide, polyvalence',                    'mental'),
  ('competitivite',    'Compétitivité',        'Envie de gagner, dépassement de soi',                  'mental'),
  ('prise_decision',   'Prise de décision',    'Décision rapide et éclairée sous pression',            'management')
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────────
-- 8) RLS — Row Level Security
-- ───────────────────────────────────────────────────
ALTER TABLE companies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements          ENABLE ROW LEVEL SECURITY;

-- Companies : lecture publique, édition par le propriétaire
DROP POLICY IF EXISTS "companies_select_public" ON companies;
DROP POLICY IF EXISTS "companies_insert_owner"  ON companies;
DROP POLICY IF EXISTS "companies_update_owner"  ON companies;
DROP POLICY IF EXISTS "companies_delete_owner"  ON companies;

CREATE POLICY "companies_select_public" ON companies FOR SELECT USING (true);
CREATE POLICY "companies_insert_owner"  ON companies FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "companies_update_owner"  ON companies FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "companies_delete_owner"  ON companies FOR DELETE USING (auth.uid() = owner_id);

-- Job applications : le candidat voit les siennes, le recruteur voit celles de ses offres
DROP POLICY IF EXISTS "ja_select_applicant" ON job_applications;
DROP POLICY IF EXISTS "ja_select_recruiter" ON job_applications;
DROP POLICY IF EXISTS "ja_insert_applicant" ON job_applications;
DROP POLICY IF EXISTS "ja_update_recruiter" ON job_applications;

CREATE POLICY "ja_select_applicant" ON job_applications
  FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "ja_select_recruiter" ON job_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_applications.job_id
        AND (
          j.author_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM companies c
            WHERE c.id = j.company_id AND c.owner_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY "ja_insert_applicant" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "ja_update_recruiter" ON job_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = job_applications.job_id
        AND (
          j.author_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM companies c
            WHERE c.id = j.company_id AND c.owner_id = auth.uid()
          )
        )
    )
  );

-- Placements : visible par le handballeur et l entreprise concernée
DROP POLICY IF EXISTS "placements_select_applicant" ON placements;
DROP POLICY IF EXISTS "placements_select_company"   ON placements;

CREATE POLICY "placements_select_applicant" ON placements
  FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "placements_select_company" ON placements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = placements.company_id AND c.owner_id = auth.uid()
    )
  );

-- ───────────────────────────────────────────────────
-- 9) RPC : matching basique entre un profil et les offres
-- ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION match_jobs_for_profile(profile_id UUID, max_results INTEGER DEFAULT 10)
RETURNS TABLE (
  job_id UUID,
  title TEXT,
  company_name TEXT,
  city TEXT,
  sector TEXT,
  match_score INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  prof_sectors TEXT[];
  prof_city TEXT;
  prof_availability DATE;
BEGIN
  SELECT desired_sectors, city, availability_date
    INTO prof_sectors, prof_city, prof_availability
    FROM profiles WHERE id = profile_id;

  RETURN QUERY
    SELECT
      j.id AS job_id,
      j.title,
      COALESCE(c.name, j.company) AS company_name,
      j.city,
      j.sector,
      (
        CASE WHEN prof_sectors IS NOT NULL AND j.sector = ANY(prof_sectors) THEN 40 ELSE 0 END +
        CASE WHEN prof_city IS NOT NULL AND j.city ILIKE '%' || prof_city || '%' THEN 30 ELSE 0 END +
        CASE WHEN j.handball_compatible THEN 20 ELSE 0 END +
        CASE WHEN j.job_type = 'reconversion' THEN 10 ELSE 0 END
      )::INTEGER AS match_score
    FROM jobs j
    LEFT JOIN companies c ON c.id = j.company_id
    WHERE j.is_active = TRUE
      AND (prof_availability IS NULL OR j.created_at >= prof_availability - INTERVAL '6 months')
    ORDER BY match_score DESC, j.created_at DESC
    LIMIT max_results;
END;
$$;

-- ───────────────────────────────────────────────────
-- 10) Vérification rapide
-- ───────────────────────────────────────────────────
-- SELECT * FROM sectors ORDER BY sort_order;
-- SELECT * FROM athlete_skills ORDER BY category;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name LIKE '%pro%';
