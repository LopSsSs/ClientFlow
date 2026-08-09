import { NextRequest, NextResponse } from 'next/server'
import { getInvoiceForPayment } from '@/lib/db/payments'

// Pública a propósito: el enlace de la factura lo abre el cliente final,
// que no tiene sesión en ClientFlow. El id de factura es un UUID (no adivinable).
export async function GET(_req: NextRequest, { params }: { params: { invoiceId: string } }) {
  const invoice = await getInvoiceForPayment(params.invoiceId)

  if (!invoice) {
    return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
  }

  return NextResponse.json(invoice)
}
