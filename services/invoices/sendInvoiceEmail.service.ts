import { getEmailService } from '@/services/email'
import { buildInvoiceEmailTemplate } from '@/services/email/templates/invoiceEmailTemplate'
import { generateInvoicePDF } from '@/lib/invoiceGenerator'
import { getInvoice, updateInvoice } from '@/lib/neon'
import { getBusinessSettings } from '@/lib/db/businessSettings'

export type SendInvoiceEmailResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'no_client_email' }

// El negocio de ClientFlow opera solo en España (Málaga) por ahora — no hay
// preferencia de idioma guardada por cliente, así que el email va en español.
const EMAIL_LOCALE = 'es'

export async function sendInvoiceEmail(
  invoiceId: string,
  businessId: string,
  businessName: string
): Promise<SendInvoiceEmailResult> {
  const invoice = await getInvoice(invoiceId, businessId)
  if (!invoice) {
    return { ok: false, reason: 'not_found' }
  }
  if (!invoice.client_email) {
    return { ok: false, reason: 'no_client_email' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const totalAmount = Number(invoice.amount) + Number(invoice.tax)
  const amountLabel = `€${totalAmount.toFixed(2)}`

  const settings = await getBusinessSettings(businessId)

  const doc = await generateInvoicePDF(
    {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      amount: invoice.amount,
      tax: invoice.tax,
      client_name: invoice.client_name,
      client_email: invoice.client_email,
      client_phone: invoice.client_phone,
      client_address: invoice.client_address,
    },
    {
      name: businessName,
      logo_url: settings?.logo_url ?? null,
      color_primary: settings?.color_primary,
      color_secondary: settings?.color_secondary,
      company_cif: settings?.company_cif,
      company_email: settings?.company_email,
      company_address: settings?.company_address,
      payment_paypal_email: settings?.payment_paypal_email,
      payment_bizum_phone: settings?.payment_bizum_phone,
      payment_transfer_enabled: settings?.payment_transfer_enabled,
      payment_transfer_iban: settings?.payment_transfer_iban,
      invoice_terms_text: settings?.invoice_terms_text,
      currency: settings?.currency,
      tax_name: settings?.tax_name,
    }
  )
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

  const { subject, html } = buildInvoiceEmailTemplate({
    companyName: businessName,
    clientName: invoice.client_name || '',
    invoiceNumber: invoice.invoice_number,
    amountLabel,
    payUrl: `${appUrl}/pay/${invoice.id}`,
    locale: EMAIL_LOCALE,
  })

  await getEmailService().send({
    to: invoice.client_email,
    subject,
    html,
    attachments: [{ filename: `factura-${invoice.invoice_number}.pdf`, content: pdfBuffer }],
  })

  // No se toca el estado si ya está pagada (o si ya estaba en 'sent'): solo
  // avanza pending -> sent, nunca retrocede.
  if (invoice.status === 'pending') {
    await updateInvoice(invoiceId, businessId, {
      amount: invoice.amount,
      tax: invoice.tax,
      status: 'sent',
      due_date: invoice.due_date,
      sent_date: new Date().toISOString(),
      paid_date: invoice.paid_date,
    })
  }

  return { ok: true }
}
