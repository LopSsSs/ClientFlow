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
