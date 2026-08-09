-- Módulo 5: geolocalización, galería de fotos y encuestas de satisfacción.

ALTER TABLE clients ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7);

CREATE TABLE IF NOT EXISTS job_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('before', 'after')),
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_photos_job_id ON job_photos(job_id);

-- Una encuesta por trabajo: el enlace público usa el job_id (UUID no adivinable),
-- igual que /pay/[invoiceId]. UNIQUE evita reenvíos duplicados.
CREATE TABLE IF NOT EXISTS satisfaction_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  sent_at TIMESTAMP,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_satisfaction_surveys_business_id ON satisfaction_surveys(business_id);
