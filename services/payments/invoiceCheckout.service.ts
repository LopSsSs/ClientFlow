import { getStripeClient } from './stripe'
import { getInvoiceForPayment, setInvoiceCheckoutSession } from '@/lib/db/payments'

export type CheckoutSessionResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'not_found' | 'already_paid' | 'no_checkout_url' }

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export async function createCheckoutSessionForInvoice(
  invoiceId: string
): Promise<CheckoutSessionResult> {
  const invoice = await getInvoiceForPayment(invoiceId)
  if (!invoice) {
    return { ok: false, reason: 'not_found' }
  }
  if (invoice.status === 'paid') {
    return { ok: false, reason: 'already_paid' }
  }

  const appUrl = getAppUrl()
  const totalCents = Math.round((invoice.amount + invoice.tax) * 100)
  const currency = (invoice.currency || 'EUR').toLowerCase()

  const stripe = getStripeClient()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    // Sin `payment_method_types`: se dejan los métodos de pago dinámicos de Stripe.
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `Factura ${invoice.invoice_number} — ${invoice.business_name}`,
          },
          unit_amount: totalCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/pay/${invoiceId}?status=success`,
    cancel_url: `${appUrl}/pay/${invoiceId}?status=cancelled`,
    metadata: { invoiceId },
    integration_identifier: 'clientflow_invoice_qxwtnkzo',
  })

  await setInvoiceCheckoutSession(invoiceId, session.id)

  if (!session.url) {
    return { ok: false, reason: 'no_checkout_url' }
  }
  return { ok: true, url: session.url }
}
