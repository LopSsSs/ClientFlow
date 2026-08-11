-- Planes de suscripción (Starter/Professional/Enterprise) vía Stripe Billing.
-- Aplicar sobre una base ya provisionada con setup-neon.sql + migraciones 001-006.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_businesses_stripe_customer_id
  ON businesses(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id
  ON subscriptions(stripe_subscription_id);
