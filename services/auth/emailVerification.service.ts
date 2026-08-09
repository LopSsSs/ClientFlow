import { markUserEmailVerified } from '@/lib/neon'
import {
  insertVerificationToken,
  findTokenByHash,
  markTokenUsed,
  invalidatePendingTokens,
} from '@/lib/db/emailVerification'
import { getEmailService } from '@/services/email'
import { buildVerifyEmailTemplate } from '@/services/email/templates/verifyEmailTemplate'
import { generateRawToken, hashToken } from '@/utils/token'
import type { EmailVerificationResult } from '@/types/emailVerification'
import type { Locale } from '@/types/i18n'

const TOKEN_TTL_HOURS = 24

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

interface SendVerificationInput {
  userId: string
  email: string
  companyName: string
  locale: Locale
}

export async function sendVerificationEmail({
  userId,
  email,
  companyName,
  locale,
}: SendVerificationInput): Promise<void> {
  await invalidatePendingTokens(userId)

  const rawToken = generateRawToken()
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000)
  await insertVerificationToken(userId, hashToken(rawToken), expiresAt)

  const verificationUrl = `${getAppUrl()}/api/auth/verify-email?token=${rawToken}`
  const { subject, html } = buildVerifyEmailTemplate({ companyName, verificationUrl, locale })

  await getEmailService().send({ to: email, subject, html })
}

export async function verifyEmailToken(rawToken: string): Promise<EmailVerificationResult> {
  const tokenHash = hashToken(rawToken)
  const token = await findTokenByHash(tokenHash)

  if (!token) {
    return { ok: false, reason: 'invalid' }
  }
  if (token.used_at) {
    return { ok: false, reason: 'already_used' }
  }
  if (new Date(token.expires_at) <= new Date()) {
    return { ok: false, reason: 'expired' }
  }

  await markTokenUsed(token.id)
  await markUserEmailVerified(token.user_id)

  return { ok: true, userId: token.user_id }
}
