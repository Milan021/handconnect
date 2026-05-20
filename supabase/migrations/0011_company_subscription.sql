-- Migration : ajout des colonnes de gestion d'abonnement entreprise

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'pending'
    CHECK (subscription_status IN ('pending','active','expired','cancelled')),
  ADD COLUMN IF NOT EXISTS subscription_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT;

COMMENT ON COLUMN companies.subscription_status IS 'Statut abonnement : pending=en attente paiement, active=payé, expired=expiré, cancelled=annulé';
COMMENT ON COLUMN companies.subscription_expires_at IS 'Date d expiration de l abonnement annuel (1 an après le paiement)';

-- Mettre à jour les entreprises existantes comme actives (période de test)
UPDATE companies SET subscription_status = 'active', subscription_expires_at = NOW() + INTERVAL '1 year' WHERE subscription_status IS NULL;
