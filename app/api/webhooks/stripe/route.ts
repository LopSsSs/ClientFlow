import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripeClient, isStripeConfigured } from '@/services/payments/stripe'
import { markInvoicePaidByCheckoutSession } from '@/lib/db/payments'

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = req.headers.get('stripe-signature')

  if (!isStripeConfigured() || !webhookSecret || !signature) {
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 400 })
  }

  // El cuerpo debe leerse en crudo: la verificación de firma de Stripe
  // depende de los bytes exactos que se enviaron.
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = getStripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('Firma de webhook de Stripe inválida:', err)
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.payment_status === 'paid') {
      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? null
      await markInvoicePaidByCheckoutSession(session.id, paymentIntentId)
    }
  }

  return NextResponse.json({ received: true })
}
