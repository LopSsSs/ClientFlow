import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSessionForInvoice } from '@/services/payments/invoiceCheckout.service'
import { isStripeConfigured } from '@/services/payments/stripe'

const STATUS_BY_REASON: Record<string, number> = {
  not_found: 404,
  already_paid: 409,
  no_checkout_url: 502,
}

export async function POST(_req: NextRequest, { params }: { params: { invoiceId: string } }) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'El cobro online todavía no está configurado' },
      { status: 503 }
    )
  }

  const result = await createCheckoutSessionForInvoice(params.invoiceId)

  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason },
      { status: STATUS_BY_REASON[result.reason] || 500 }
    )
  }

  return NextResponse.json({ url: result.url })
}
