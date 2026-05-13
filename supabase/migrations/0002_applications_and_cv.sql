-- ============================================================
-- HandConnect — Migration 002
-- Candidatures + CV (storage)
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- ───────────────────────────────────────────────────
-- 1) Champs CV permanent sur le profil
-- ───────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cv_url      TEXT,
  ADD COLUMN IF NOT EXISTS cv_filename TEXT,
  ADD COLUMN IF NOT EXISTS cv_uploaded_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.cv_url IS
  'URL publique du CV stocké dans le bucket storage "cvs". Utilisé par défaut lors d''une candidature.';

-- ───────────────────────────────────────────────────
-- 2) Table des candidatures
-- ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  annonce_id    UUID NOT NULL REFERENCES annonces(id) ON DELETE CASCADE,
  applicant_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message       TEXT,
  cv_url        TEXT,
  cv_filename   TEXT,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','seen','accepted','rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (annonce_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_annonce   ON applications(annonce_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status    ON applications(status);

-- ───────────────────────────────────────────────────
-- 3) RLS — Row Level Security
-- ───────────────────────────────────────────────────
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applicant_select_own"     ON applications;
DROP POLICY IF EXISTS "owner_select_for_annonce" ON applications;
DROP POLICY IF EXISTS "applicant_insert"         ON applications;
DROP POLICY IF EXISTS "applicant_delete"         ON applications;
DROP POLICY IF EXISTS "owner_update_status"      ON applications;

CREATE POLICY "applicant_select_own" ON applications
  FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "owner_select_for_annonce" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM annonces a
      WHERE a.id = applications.annonce_id
        AND a.author_id = auth.uid()
    )
  );

CREATE POLICY "applicant_insert" ON applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "applicant_delete" ON applications
  FOR DELETE USING (auth.uid() = applicant_id);

CREATE POLICY "owner_update_status" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM annonces a
      WHERE a.id = applications.annonce_id
        AND a.author_id = auth.uid()
    )
  );

-- ───────────────────────────────────────────────────
-- 4) Trigger : auto-incrément candidatures_count sur annonces
-- ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_candidatures_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE annonces
       SET candidatures_count = COALESCE(candidatures_count, 0) + 1
     WHERE id = NEW.annonce_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE annonces
       SET candidatures_count = GREATEST(COALESCE(candidatures_count, 0) - 1, 0)
     WHERE id = OLD.annonce_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_candidatures_count ON applications;
CREATE TRIGGER trg_update_candidatures_count
  AFTER INSERT OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_candidatures_count();

-- ───────────────────────────────────────────────────
-- 5) Bucket Storage "cvs"
--    NOTE : ce bloc peut échouer si vous n'avez pas les droits. Dans ce cas,
--    créez le bucket manuellement dans Supabase Dashboard > Storage :
--      - Nom : cvs
--      - Public : OUI
-- ───────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policies storage : upload/delete dans son propre dossier, lecture publique
DROP POLICY IF EXISTS "users_upload_own_cv" ON storage.objects;
DROP POLICY IF EXISTS "users_update_own_cv" ON storage.objects;
DROP POLICY IF EXISTS "users_delete_own_cv" ON storage.objects;
DROP POLICY IF EXISTS "anyone_read_cvs"     ON storage.objects;

CREATE POLICY "users_upload_own_cv" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cvs' AND auth.role() = 'authenticated'
      AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "users_update_own_cv" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "users_delete_own_cv" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "anyone_read_cvs" ON storage.objects
  FOR SELECT USING (bucket_id = 'cvs');

-- ───────────────────────────────────────────────────
-- 6) Vérification
-- ───────────────────────────────────────────────────
-- SELECT count(*) FROM applications;
-- SELECT * FROM storage.buckets WHERE id = 'cvs';
