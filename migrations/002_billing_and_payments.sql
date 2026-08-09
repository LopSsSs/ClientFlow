-- Fase 2: gestión de márgenes/estimador de precio + cobro online con Stripe.
-- Aplicar sobre una base de datos ya provisionada con setup-neon.sql + 001_email_verification.sql.

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS default_hourly_rate DECIMAL(10,2);

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_invoices_stripe_checkout_session_id
  ON invoices(stripe_checkout_session_id);
