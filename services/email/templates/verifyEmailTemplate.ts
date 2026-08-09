import { translate } from '@/utils/i18n'
import type { Locale } from '@/types/i18n'

interface VerifyEmailTemplateInput {
  companyName: string
  verificationUrl: string
  locale: Locale
}

export function buildVerifyEmailTemplate({
  companyName,
  verificationUrl,
  locale,
}: VerifyEmailTemplateInput): { subject: string; html: string } {
  const vars = { companyName }
  const subject = translate(locale, 'emailVerification.subject', vars)

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>${translate(locale, 'emailVerification.greeting')}</h2>
      <p>${translate(locale, 'emailVerification.body', vars)}</p>
      <p style="text-align: center; margin: 32px 0;">
        <a href="${verificationUrl}"
           style="background:#1a2e1a;color:#c9a84c;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          ${translate(locale, 'emailVerification.cta')}
        </a>
      </p>
      <p style="color:#666;font-size:13px;">${translate(locale, 'emailVerification.expiryNote')}</p>
      <p style="color:#666;font-size:13px;">${translate(locale, 'emailVerification.ignoreNote')}</p>
    </div>
  `

  return { subject, html }
}
