-- ============================================================
-- HandballConnect — Migration 007
-- Champs profil entraîneur (diplôme, spécialités, expérience)
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS coaching_diploma   TEXT,
  ADD COLUMN IF NOT EXISTS coaching_level     TEXT,
  ADD COLUMN IF NOT EXISTS coaching_specialties TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS coaching_categories TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS coaching_experience_years INT,
  ADD COLUMN IF NOT EXISTS coaching_current_role TEXT;

COMMENT ON COLUMN profiles.coaching_diploma   IS 'Diplôme entraîneur : titre4 (BPJEPS), titre5 (DEJEPS/DESJEPS), be, cqp, staps, brevet_federal, none';
COMMENT ON COLUMN profiles.coaching_level     IS 'Niveau actuel entraîné : departemental → starligue';
COMMENT ON COLUMN profiles.coaching_specialties IS 'Spécialités : gardiens, attaque, defense, physique, jeunes, mental';
COMMENT ON COLUMN profiles.coaching_categories  IS 'Catégories entraînées : seniors, -18, -16, -14, mini-hand, etc.';
COMMENT ON COLUMN profiles.coaching_experience_years IS 'Années d''expérience d''entraîneur';
COMMENT ON COLUMN profiles.coaching_current_role IS 'Poste actuel : entraîneur principal, adjoint, préparateur physique, etc.';
