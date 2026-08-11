// Catálogo de planes de suscripción. Única fuente de verdad usada por la
// landing (app/page.jsx), el checkout (app/api/subscribe) y el límite de
// clientes por plan (app/api/clients). Los stripePriceId son de la cuenta
// LIVE de Stripe (acct_1U2JXzGq89FC4bFl) — no existen equivalentes en el
// sandbox de test, así que el checkout de planes solo funciona en producción.
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    priceLabel: '19,99€',
    stripePriceId: 'price_1U3OZsGq89FC4bFlDtmaEUk1',
    maxClients: 50,
    features: ['50 clientes', 'Ilimitados trabajos', 'Facturas básicas', 'Email support'],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    priceLabel: '49,99€',
    stripePriceId: 'price_1U3Oa9Gq89FC4bFlSEbonkkV',
    maxClients: 200,
    features: ['200 clientes', 'Ilimitados trabajos', 'Reportes avanzados', 'Prioridad 24/7'],
    highlight: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceLabel: '99,99€',
    stripePriceId: 'price_1U3OaLGq89FC4bFlpeTmRNyv',
    maxClients: null, // null = sin límite
    features: ['Ilimitados clientes', 'Integraciones custom', 'Dedicado', 'SLA garantizado'],
  },
}

export function getPlan(planId) {
  return PLANS[planId]
}
