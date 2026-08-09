export interface EmailVerificationToken {
  id: string
  user_id: string
  // Se guarda el hash SHA-256 del token, nunca el token en claro.
  token_hash: string
  expires_at: string
  used_at: string | null
  created_at: string
}

export type EmailVerificationResult =
  | { ok: true; userId: string }
  | { ok: false; reason: 'invalid' | 'expired' | 'already_used' }
