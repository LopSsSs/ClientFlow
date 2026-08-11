import { sql } from '@/lib/neon'

export interface SubscriptionInfo {
  id: string
  plan: string
  status: string
  current_period_start: string | null
  current_period_end: string | null
  max_clients: number
}

// Se llama una única vez, justo al crear el negocio en el registro.
// `ON CONFLICT DO NOTHING` la hace idempotente (user_id es UNIQUE) por si
// signup se reintenta tras un fallo parcial.
export async function startTrial(userId: string): Promise<void> {
  await sql`
    INSERT INTO subscriptions (user_id, plan, status, current_period_start, current_period_end)
    VALUES (${userId}, 'trial', 'trialing', NOW(), NOW() + INTERVAL '14 days')
    ON CONFLICT (user_id) DO NOTHING
  `
}

export async function getSubscription(userId: string): Promise<SubscriptionInfo | undefined> {
  const result = await sql<SubscriptionInfo[]>`
    SELECT id, plan, status, current_period_start, current_period_end, max_clients
    FROM subscriptions
    WHERE user_id = ${userId}
  `
  return result[0]
}

// La comparación de expiración se resuelve en el propio Postgres (NOW()), nunca
// con el reloj del servidor de la app: si los dos relojes no coinciden exactamente,
// comparar en JS puede dejar pasar un trial que ya debería estar bloqueado.
export async function isTrialExpired(userId: string): Promise<boolean> {
  const result = await sql<{ expired: boolean }[]>`
    SELECT (status = 'trialing' AND current_period_end < NOW()) AS expired
    FROM subscriptions WHERE user_id = ${userId}
  `
  return result[0]?.expired ?? false
}

export async function setBusinessStripeCustomerId(
  businessId: string,
  stripeCustomerId: string
): Promise<void> {
  await sql`
    UPDATE businesses SET stripe_customer_id = ${stripeCustomerId}, updated_at = NOW()
    WHERE id = ${businessId}
  `
}

export async function getUserIdByStripeCustomerId(
  stripeCustomerId: string
): Promise<string | undefined> {
  const result = await sql<{ user_id: string }[]>`
    SELECT user_id FROM businesses WHERE stripe_customer_id = ${stripeCustomerId}
  `
  return result[0]?.user_id
}

// Se llama desde el webhook de Stripe cuando una suscripción de pago se activa.
// Sustituye el estado de trial por el plan real; current_period_end pasa a marcar
// la próxima renovación (Stripe re-factura y el webhook la vuelve a actualizar).
export async function activateSubscriptionPlan(params: {
  userId: string
  plan: string
  stripeSubscriptionId: string
  currentPeriodStart: string
  currentPeriodEnd: string
  maxClients: number | null
}): Promise<void> {
  await sql`
    UPDATE subscriptions
    SET plan = ${params.plan},
        status = 'active',
        stripe_subscription_id = ${params.stripeSubscriptionId},
        current_period_start = ${params.currentPeriodStart},
        current_period_end = ${params.currentPeriodEnd},
        max_clients = ${params.maxClients},
        updated_at = NOW()
    WHERE user_id = ${params.userId}
  `
}

export async function markSubscriptionCanceled(stripeSubscriptionId: string): Promise<void> {
  await sql`
    UPDATE subscriptions SET status = 'canceled', updated_at = NOW()
    WHERE stripe_subscription_id = ${stripeSubscriptionId}
  `
}
