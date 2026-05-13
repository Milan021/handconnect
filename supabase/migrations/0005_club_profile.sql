-- ============================================================
-- HandConnect — Migration 005
-- Enrichissement profil club : annee de creation, licencies,
-- objectifs et motivation a rejoindre le club
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS founded_year INTEGER,
  ADD COLUMN IF NOT EXISTS member_count INTEGER,
  ADD COLUMN IF NOT EXISTS goals        TEXT,
  ADD COLUMN IF NOT EXISTS motivation   TEXT;

COMMENT ON COLUMN clubs.founded_year IS 'Année de création du club (ex: 1985)';
COMMENT ON COLUMN clubs.member_count IS 'Nombre total de licenciés';
COMMENT ON COLUMN clubs.goals        IS 'Objectifs sportifs et structurels du club';
COMMENT ON COLUMN clubs.motivation   IS 'Raisons pour lesquelles un joueur/coach devrait rejoindre le club';
