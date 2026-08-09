import Stripe from 'stripe'

let cachedClient: Stripe | null = null

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

// Instancia única de StripeClient (nunca el patrón global `stripe.apiKey = ...`,
// deprecado en el SDK).
export function getStripeClient(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY no está configurada')
  }
  if (!cachedClient) {
    cachedClient = new Stripe(apiKey, { apiVersion: '2026-07-29.dahlia' })
  }
  return cachedClient
}
