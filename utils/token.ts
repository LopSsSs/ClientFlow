import { randomBytes, createHash } from 'crypto'

// El token en claro solo existe en el enlace enviado por email; en la base
// de datos únicamente se guarda su hash SHA-256 (ver hashToken).
export function generateRawToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}
