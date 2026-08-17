import type { ReactNode } from 'react'
import type { Business } from '@/types/business'
import type { SubscriptionInfo } from '@/lib/db/subscriptions'

// AuthContext.jsx sigue sin migrar a TypeScript (ver decisión de Fase 1: allowJs
// para no tocar lo que ya funciona). Este .d.ts tipa su superficie pública para
// que los componentes .tsx que lo consumen (p.ej. Settings) compilen en modo strict.
export interface AuthUser {
  id: string
  email: string
  email_verified: boolean
}

export interface AuthContextValue {
  user: AuthUser | null
  business: Business | null
  subscription: SubscriptionInfo | null
  loading: boolean
  error: string | null
  signUp: (
    email: string,
    password: string,
    businessName: string
  ) => Promise<{ user: AuthUser; business: Business }>
  signIn: (email: string, password: string) => Promise<{ user: AuthUser; business: Business }>
  signOut: () => Promise<void>
  setBusiness: (business: Business | null) => void
  refreshAuth: () => Promise<void>
}

export function AuthProvider(props: { children: ReactNode }): JSX.Element
export function useAuth(): AuthContextValue
