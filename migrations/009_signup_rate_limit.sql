-- Limita cuántas cuentas se pueden crear desde la misma IP en poco tiempo,
-- para dificultar la creación masiva de cuentas de prueba (con la
-- verificación de email ya funcionando, la única forma barata de abusar de
-- los 14 días gratis que queda es automatizar el registro).
CREATE TABLE IF NOT EXISTS signup_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address VARCHAR(45) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signup_attempts_ip_created ON signup_attempts(ip_address, created_at);
