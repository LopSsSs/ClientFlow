import { getStripeClient, isStripeConfigured } from './stripe'
import { getPlan } from '@/lib/plans'
import { setBusinessStripeCustomerId } from '@/lib/db/subscriptions'

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

  // Reutilizamos el Customer si el negocio ya tiene uno (de un plan anterior);
  // si no, se crea aquí y se guarda para la próxima vez.
  let customerId = params.existingStripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: params.businessEmail,
      metadata: { businessId: params.businessId, userId: params.userId },
    })
    customerId = customer.id
    await setBusinessStripeCustomerId(params.businessId, customerId)
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
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
