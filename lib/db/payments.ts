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
  payment_bizum_phone: string | null
  payment_transfer_enabled: boolean
  payment_transfer_iban: string | null
}

export async function getInvoiceForPayment(
  invoiceId: string
): Promise<InvoiceForPayment | undefined> {
  const result = await sql<InvoiceForPayment[]>`
    SELECT i.id, i.invoice_number, i.amount, i.tax, i.status,
           b.name AS business_name, b.currency AS currency,
           c.name AS client_name,
           bs.payment_paypal_email AS payment_paypal_email,
           bs.payment_bizum_phone AS payment_bizum_phone,
           COALESCE(bs.payment_transfer_enabled, false) AS payment_transfer_enabled,
           bs.payment_transfer_iban AS payment_transfer_iban
    FROM invoices i
    JOIN businesses b ON b.id = i.business_id
    LEFT JOIN clients c ON c.id = i.client_id
    LEFT JOIN business_settings bs ON bs.business_id = i.business_id
    WHERE i.id = ${invoiceId}
  `
  return result[0]
}

// El webhook de Stripe identifica la factura por el id de sesión, no por businessId
// (el evento llega del lado de Stripe, no de una petición autenticada del negocio).
// Se conserva para facturas ya cobradas antes de retirar Stripe como método de
// pago de los clientes finales: Stripe ahora solo se usa para las
// suscripciones de ClientFlow (lib/plans.ts), no para cobrar facturas.
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
