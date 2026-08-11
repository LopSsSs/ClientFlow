import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripeClient, isStripeConfigured } from '@/services/payments/stripe'
import { markInvoicePaidByCheckoutSession } from '@/lib/db/payments'
import { activateSubscriptionPlan, markSubscriptionCanceled, setBusinessStripeCustomerId } from '@/lib/db/subscriptions'
import { getBusiness } from '@/lib/neon'
import { getPlan } from '@/lib/plans'

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
    // mode='payment' es el pago suelto de una factura; mode='subscription' es
    // la contratación de un plan, que se sincroniza aparte vía los eventos
    // customer.subscription.* (esos sí incluyen las fechas del periodo).
    if (session.mode === 'payment' && session.payment_status === 'paid') {
      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? null
      await markInvoicePaidByCheckoutSession(session.id, paymentIntentId)
    }
  }

  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata.userId
    const planId = subscription.metadata.planId
    const plan = planId ? getPlan(planId) : undefined
    const item = subscription.items.data[0]

    if (userId && plan && item && (subscription.status === 'active' || subscription.status === 'trialing')) {
      await activateSubscriptionPlan({
        userId,
        plan: plan.id,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: new Date(item.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(item.current_period_end * 1000).toISOString(),
        maxClients: plan.maxClients,
      })

      // Guardamos el Customer creado por Checkout para reutilizarlo la próxima
      // vez que este negocio cambie de plan (evita duplicar Customers en Stripe).
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id
      if (customerId) {
        const business = await getBusiness(userId)
        if (business && business.stripe_customer_id !== customerId) {
          await setBusinessStripeCustomerId(business.id, customerId)
        }
      }
    } else if (
      subscription.status === 'canceled' ||
      subscription.status === 'unpaid' ||
      subscription.status === 'incomplete_expired'
    ) {
      await markSubscriptionCanceled(subscription.id)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    await markSubscriptionCanceled(subscription.id)
  }

  return NextResponse.json({ received: true })
}
