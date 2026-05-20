-- Migration : ajout du niveau d'accompagnement reconversion aux offres d'emploi
-- Chaque offre peut proposer un package d'accompagnement pour le joueur recruté

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS reconversion_package TEXT DEFAULT 'none'
    CHECK (reconversion_package IN ('none','basic','complete'));

COMMENT ON COLUMN jobs.reconversion_package IS
  'Niveau d''accompagnement reconversion offert par l''entreprise : none=aucun, basic=bilan+2 séances coaching, complete=bilan+6 mois+soft skills';
