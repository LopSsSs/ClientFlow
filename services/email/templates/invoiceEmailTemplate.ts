import { translate } from '@/utils/i18n'
import type { Locale } from '@/types/i18n'

interface InvoiceEmailTemplateInput {
  companyName: string
  clientName: string
  invoiceNumber: string
  amountLabel: string
  payUrl: string
  locale: Locale
}

export function buildInvoiceEmailTemplate({
  companyName,
  clientName,
  invoiceNumber,
  amountLabel,
  payUrl,
  locale,
}: InvoiceEmailTemplateInput): { subject: string; html: string } {
  const vars = { companyName, clientName, invoiceNumber, amount: amountLabel }
  const subject = translate(locale, 'invoiceEmail.subject', vars)

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>${translate(locale, 'invoiceEmail.greeting', vars)}</h2>
      <p>${translate(locale, 'invoiceEmail.body', vars)}</p>
      <p style="text-align: center; margin: 32px 0;">
        <a href="${payUrl}"
           style="background:#1a2e1a;color:#c9a84c;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          ${translate(locale, 'invoiceEmail.payCta')}
        </a>
      </p>
      <p style="color:#666;font-size:13px;">${translate(locale, 'invoiceEmail.attachmentNote')}</p>
    </div>
  `

  return { subject, html }
}
