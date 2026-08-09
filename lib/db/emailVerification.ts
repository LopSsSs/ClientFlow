import { sql } from '@/lib/neon'
import type { EmailVerificationToken } from '@/types/emailVerification'

export async function insertVerificationToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<EmailVerificationToken> {
  const result = await sql<EmailVerificationToken[]>`
    INSERT INTO email_verification_tokens (user_id, token_hash, expires_at, created_at)
    VALUES (${userId}, ${tokenHash}, ${expiresAt.toISOString()}, NOW())
    RETURNING *
  `
  // INSERT ... RETURNING siempre produce una fila o lanza; el undefined de
  // noUncheckedIndexedAccess aquí es un falso positivo del compilador.
  return result[0]!
}

export async function findTokenByHash(
  tokenHash: string
): Promise<EmailVerificationToken | undefined> {
  const result = await sql<EmailVerificationToken[]>`
    SELECT * FROM email_verification_tokens WHERE token_hash = ${tokenHash}
  `
  return result[0]
}

export async function markTokenUsed(tokenId: string): Promise<void> {
  await sql`
    UPDATE email_verification_tokens SET used_at = NOW() WHERE id = ${tokenId}
  `
}

// Invalida los tokens pendientes previos del usuario antes de emitir uno nuevo,
// para que un reenvío no deje varios enlaces válidos circulando a la vez.
export async function invalidatePendingTokens(userId: string): Promise<void> {
  await sql`
    UPDATE email_verification_tokens
    SET used_at = NOW()
    WHERE user_id = ${userId} AND used_at IS NULL
  `
}
