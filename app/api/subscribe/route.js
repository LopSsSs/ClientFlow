import { NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth'
import { getBusiness } from '@/lib/neon'
import { createCheckoutSessionForPlan } from '@/services/payments/subscriptionCheckout.service'
import { getPlan } from '@/lib/plans'

const STATUS_BY_REASON = {
  not_configured: 503,
  invalid_plan: 400,
  no_checkout_url: 502,
}

// Deliberadamente NO usa requireBusiness(): esa función bloquea con 402 si el
// trial ya expiró, y contratar un plan de pago es justo la vía para salir de
// ese bloqueo. Aquí solo hace falta una sesión válida, no un trial vigente.
export async function POST(req) {
  const decoded = verifyAuthToken(req)
  if (!decoded) {
    return NextResponse.json({ error: 'Sesión inválida o expirada' }, { status: 401 })
  }

  const body = await req.json()

  if (!getPlan(body.planId)) {
    return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })
  }

  const business = await getBusiness(decoded.userId)
  if (!business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  const result = await createCheckoutSessionForPlan({
    planId: body.planId,
    userId: decoded.userId,
    businessId: business.id,
    businessEmail: decoded.email,
    existingStripeCustomerId: business.stripe_customer_id,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: STATUS_BY_REASON[result.reason] || 500 })
  }

  return NextResponse.json({ url: result.url })
}
