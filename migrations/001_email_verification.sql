-- Verificación de email obligatoria.
-- Aplicar sobre una base de datos ya provisionada con setup-neon.sql.
-- (Las instalaciones nuevas ya incluyen esto directamente en setup-neon.sql.)

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

-- Las cuentas creadas antes de esta migración se consideran verificadas:
-- no tiene sentido bloquear retroactivamente a usuarios que ya estaban activos.
UPDATE users SET email_verified = true WHERE email_verified = false;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Se guarda el hash SHA-256 del token enviado por email, nunca el token en claro.
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token_hash ON email_verification_tokens(token_hash);
