-- Fase 3: integración de WhatsApp vía Make.com (número compartido de ClientFlow).
-- message_log pasa a registrar también eventos entrantes (respuestas del cliente,
-- confirmaciones de entrega) que no siempre están ligados a un job/invoice concreto.

ALTER TABLE message_log ALTER COLUMN related_type DROP NOT NULL;
ALTER TABLE message_log ALTER COLUMN related_id DROP NOT NULL;

ALTER TABLE message_log ADD COLUMN IF NOT EXISTS direction VARCHAR(10) NOT NULL DEFAULT 'outbound';
ALTER TABLE message_log ADD COLUMN IF NOT EXISTS provider_message_id VARCHAR(255);
ALTER TABLE message_log ADD COLUMN IF NOT EXISTS body TEXT;

CREATE INDEX IF NOT EXISTS idx_message_log_provider_message_id ON message_log(provider_message_id);
