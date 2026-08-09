-- Fase 3: recordatorios automáticos, plantillas de mensajes y trabajos recurrentes.

-- Recordatorio de trabajo próximo (una vez por trabajo).
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP;

-- Aviso de cobro: se reenvía solo cuando la factura entra en un tramo de
-- vencimiento nuevo (7/30/60 días), no todos los días.
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_reminder_bucket VARCHAR(20);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_id, type)
);

CREATE INDEX IF NOT EXISTS idx_message_templates_business_id ON message_templates(business_id);

CREATE TABLE IF NOT EXISTS message_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL,
  template_type VARCHAR(30) NOT NULL,
  related_type VARCHAR(20) NOT NULL,
  related_id UUID NOT NULL,
  to_number VARCHAR(30) NOT NULL,
  status VARCHAR(20) NOT NULL,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_log_business_id ON message_log(business_id);

CREATE TABLE IF NOT EXISTS recurring_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  service_type VARCHAR(50),
  duration_hours DECIMAL(10,2) DEFAULT 0,
  materials_cost DECIMAL(10,2) DEFAULT 0,
  labor_cost DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  next_run_date DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurring_jobs_business_id ON recurring_jobs(business_id);
CREATE INDEX IF NOT EXISTS idx_recurring_jobs_next_run_date ON recurring_jobs(next_run_date);
