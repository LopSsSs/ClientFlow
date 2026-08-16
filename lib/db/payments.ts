import { sql } from '@/lib/neon'

// Forma mínima y pública (sin businessId) para la página de cobro: el enlace
// de pago lo abre el cliente final, que no tiene sesión en ClientFlow.
export interface InvoiceForPayment {
  id: string
  invoice_number: string
  amount: number
  tax: number
  status: string
  business_name: string
  currency: string
  client_name: string | null
  payment_paypal_email: string | null
}

export async function getInvoiceForPayment(
  invoiceId: string
): Promise<InvoiceForPayment | undefined> {
  const result = await sql<InvoiceForPayment[]>`
    SELECT i.id, i.invoice_number, i.amount, i.tax, i.status,
           b.name AS business_name, b.currency AS currency,
           c.name AS client_name,
           bs.payment_paypal_email AS payment_paypal_email
    FROM invoices i
    JOIN businesses b ON b.id = i.business_id
    LEFT JOIN clients c ON c.id = i.client_id
    LEFT JOIN business_settings bs ON bs.business_id = i.business_id
    WHERE i.id = ${invoiceId}
  `
  return result[0]
}

export async function setInvoiceCheckoutSession(
  invoiceId: string,
  sessionId: string
): Promise<void> {
  await sql`
    UPDATE invoices
    SET stripe_checkout_session_id = ${sessionId}, updated_at = NOW()
    WHERE id = ${invoiceId}
  `
}

// El webhook de Stripe identifica la factura por el id de sesión, no por businessId
// (el evento llega del lado de Stripe, no de una petición autenticada del negocio).
export async function markInvoicePaidByCheckoutSession(
  sessionId: string,
  paymentIntentId: string | null
): Promise<void> {
  await sql`
    UPDATE invoices
    SET status = 'paid', paid_date = NOW(), stripe_payment_intent_id = ${paymentIntentId}, updated_at = NOW()
    WHERE stripe_checkout_session_id = ${sessionId}
  `
}
