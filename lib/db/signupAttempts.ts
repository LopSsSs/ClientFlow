import { sql } from '@/lib/neon'

const WINDOW_MINUTES = 60
const MAX_SIGNUPS_PER_WINDOW = 3

// Cuenta solo cuentas realmente creadas (se registra tras el INSERT en
// users, no en cada intento) — el objetivo es limitar cuántos negocios de
// prueba puede generar una misma IP, no penalizar reintentos por typos.
export async function isSignupRateLimited(ipAddress: string): Promise<boolean> {
  const result = await sql<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM signup_attempts
    WHERE ip_address = ${ipAddress} AND created_at > NOW() - make_interval(mins => ${WINDOW_MINUTES})
  `
  return (result[0]?.count ?? 0) >= MAX_SIGNUPS_PER_WINDOW
}

export async function recordSignupAttempt(ipAddress: string): Promise<void> {
  await sql`INSERT INTO signup_attempts (ip_address) VALUES (${ipAddress})`
}
