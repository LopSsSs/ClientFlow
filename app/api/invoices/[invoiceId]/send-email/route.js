import { NextResponse } from 'next/server'
import { requireBusiness, errorResponse } from '@/lib/auth'
import { sendInvoiceEmail } from '@/services/invoices/sendInvoiceEmail.service'

const STATUS_BY_REASON = {
  not_found: 404,
  no_client_email: 400,
}

export async function POST(req, { params }) {
  try {
    const { business } = await requireBusiness(req)

    const result = await sendInvoiceEmail(params.invoiceId, business.id, business.name)

    if (!result.ok) {
      const message =
        result.reason === 'no_client_email'
          ? 'El cliente de esta factura no tiene email registrado'
          : 'Factura no encontrada'
      return NextResponse.json({ error: message }, { status: STATUS_BY_REASON[result.reason] || 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
