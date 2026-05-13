-- ============================================================
-- HandConnect — Migration 001
-- Centres de formation + champs RGPD mineurs
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- ───────────────────────────────────────────────────
-- 1) Centre de formation (pôle, centre pro, section sportive)
-- ───────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS training_center TEXT;

COMMENT ON COLUMN profiles.training_center IS
  'ID du centre de formation (voir lib/training-centers.js). NULL si aucun.';

-- ───────────────────────────────────────────────────
-- 2) Représentant légal — obligatoire si le joueur est mineur
-- ───────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS parent_first_name TEXT,
  ADD COLUMN IF NOT EXISTS parent_last_name  TEXT,
  ADD COLUMN IF NOT EXISTS parent_email      TEXT,
  ADD COLUMN IF NOT EXISTS parent_phone      TEXT,
  ADD COLUMN IF NOT EXISTS parent_consent_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.parent_consent_at IS
  'Horodatage du consentement parental pour les joueurs <18 ans (RGPD)';

-- ───────────────────────────────────────────────────
-- 3) Contrainte : si âge < 18 ans, le consentement est requis
--    (vérification souple : on l''applique au moment de l''affichage,
--     mais on ajoute un index pour requêtes rapides)
-- ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_age          ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_training     ON profiles(training_center);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type    ON profiles(user_type);

-- ───────────────────────────────────────────────────
-- 4) Vérification du résultat (à lancer après la migration)
-- ───────────────────────────────────────────────────
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'profiles'
--   AND column_name IN (
--     'training_center', 'parent_first_name', 'parent_last_name',
--     'parent_email', 'parent_phone', 'parent_consent_at'
--   );
