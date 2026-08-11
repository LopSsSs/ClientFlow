'use client'

import { useState } from 'react'

// Compartido entre TrialExpiredScreen y /dashboard/plan: llama a /api/subscribe
// y redirige a Stripe Checkout. Solo funciona con sesión iniciada (requiere cookie).
export function usePlanCheckout() {
  const [choosingPlan, setChoosingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')

  const choosePlan = async (planId: string) => {
    setChoosingPlan(planId)
    setError('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar el pago')
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
      setChoosingPlan(null)
    }
  }

  return { choosingPlan, error, choosePlan }
}
