-- ============================================================
-- HandConnect — Migration 006
-- Abonnement club + essai gratuit 7 jours
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

ALTER TABLE clubs
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free'
    CHECK (subscription_plan IN ('free','standard','premium')),
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial'
    CHECK (subscription_status IN ('trial','active','expired','cancelled')),
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_ends_at    TIMESTAMPTZ;

COMMENT ON COLUMN clubs.subscription_plan      IS 'Plan choisi : free | standard | premium';
COMMENT ON COLUMN clubs.subscription_status    IS 'trial pendant 7 jours, puis active si paiement, sinon expired';
COMMENT ON COLUMN clubs.trial_started_at       IS 'Début de la période d''essai de 7 jours';
COMMENT ON COLUMN clubs.trial_ends_at          IS 'Fin de la période d''essai (trial_started_at + 7 jours)';
COMMENT ON COLUMN clubs.subscription_started_at IS 'Début de l''abonnement payant (après essai)';
COMMENT ON COLUMN clubs.subscription_ends_at    IS 'Fin de l''abonnement payant';

-- Initialise un essai 7j pour les clubs existants qui n'en ont pas
UPDATE clubs
SET trial_started_at = NOW(),
    trial_ends_at    = NOW() + INTERVAL '7 days',
    subscription_status = 'trial',
    subscription_plan = COALESCE(subscription_plan, 'free')
WHERE trial_ends_at IS NULL;
