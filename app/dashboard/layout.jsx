'use client'

import { useAuth } from '@/context/AuthContext'
import TrialExpiredScreen from '@/components/TrialExpiredScreen'

function isTrialExpired(subscription) {
  return (
    subscription?.status === 'trialing' &&
    subscription.current_period_end &&
    new Date(subscription.current_period_end).getTime() < Date.now()
  )
}

// Bloquea todo /dashboard/* una vez terminada la prueba gratuita. El backend
// (requireBusiness en lib/auth.js) hace la misma comprobación por su cuenta, así
// que esto es defensa en profundidad, no la única barrera.
export default function DashboardLayout({ children }) {
  const { subscription, loading } = useAuth()

  if (loading) return null
  if (isTrialExpired(subscription)) return <TrialExpiredScreen />

  return children
}
