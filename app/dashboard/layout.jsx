'use client'

import { useAuth } from '@/context/AuthContext'
import TrialExpiredScreen from '@/components/TrialExpiredScreen'
import EmailNotVerifiedScreen from '@/components/EmailNotVerifiedScreen'

function isTrialExpired(subscription) {
  return (
    subscription?.status === 'trialing' &&
    subscription.current_period_end &&
    new Date(subscription.current_period_end).getTime() < Date.now()
  )
}

// Bloquea todo /dashboard/* hasta que el email esté verificado, y después
// hasta que termine la prueba gratuita. El backend (requireBusiness en
// lib/auth.js) hace las mismas comprobaciones por su cuenta, así que esto es
// defensa en profundidad, no la única barrera.
export default function DashboardLayout({ children }) {
  const { user, subscription, loading } = useAuth()

  if (loading) return null
  if (user && !user.email_verified) return <EmailNotVerifiedScreen />
  if (isTrialExpired(subscription)) return <TrialExpiredScreen />

  return children
}
