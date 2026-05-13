-- ============================================================
-- HandConnect — Migration 003
-- Région du joueur + mobilité géographique
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS region                TEXT,
  ADD COLUMN IF NOT EXISTS mobile_other_regions  BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN profiles.region IS
  'ID région (voir lib/regions.js : ara, bfc, bretagne, idf, etc.)';
COMMENT ON COLUMN profiles.mobile_other_regions IS
  'TRUE si le joueur est ouvert à un transfert dans une autre région.';

CREATE INDEX IF NOT EXISTS idx_profiles_region ON profiles(region);
