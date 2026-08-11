import { getStripeClient, isStripeConfigured } from './stripe'
import { getPlan } from '@/lib/plans'

export type SubscriptionCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; reason: 'invalid_plan' | 'not_configured' | 'no_checkout_url' }

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export async function createCheckoutSessionForPlan(params: {
  planId: string
  userId: string
  businessId: string
  businessEmail: string
  existingStripeCustomerId: string | null
}): Promise<SubscriptionCheckoutResult> {
  if (!isStripeConfigured()) {
    return { ok: false, reason: 'not_configured' }
  }

  const plan = getPlan(params.planId)
  if (!plan) {
    return { ok: false, reason: 'invalid_plan' }
  }

  const stripe = getStripeClient()
  const appUrl = getAppUrl()

  // La clave restringida de Stripe solo tiene permiso de "Checkout Sessions"
  // (mínimo privilegio), no de "Customers" — así que no llamamos a
  // stripe.customers.create() aparte. En modo subscription, Checkout crea el
  // Customer él solo a partir de customer_email si no le pasamos uno ya existente.
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    ...(params.existingStripeCustomerId
      ? { customer: params.existingStripeCustomerId }
      : { customer_email: params.businessEmail }),
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?subscribed=success`,
    cancel_url: `${appUrl}/dashboard?subscribed=cancelled`,
    metadata: { userId: params.userId, planId: plan.id },
    // El webhook solo recibe el objeto Subscription (no la Session) en los
    // eventos de renovación/cambio posteriores, así que el plan/userId tienen
    // que viajar también en la metadata de la propia suscripción, no solo de la sesión.
    subscription_data: {
      metadata: { userId: params.userId, planId: plan.id },
    },
  })

  if (!session.url) {
    return { ok: false, reason: 'no_checkout_url' }
  }
  return { ok: true, url: session.url }
}
