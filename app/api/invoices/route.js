import { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, getClient } from '@/lib/neon'
import { requireBusiness, errorResponse, badRequest } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const { business } = await requireBusiness(req)
    const invoices = await getInvoices(business.id)
    return NextResponse.json({ data: invoices })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(req) {
  try {
    const { business } = await requireBusiness(req)
    const body = await req.json()

    if (!body.client_id) {
      return badRequest('La factura debe tener un cliente')
    }

    // El cliente debe pertenecer al negocio del usuario
    const client = await getClient(body.client_id, business.id)
    if (!client) {
      return badRequest('Cliente no válido')
    }

    const amount = parseFloat(body.amount)
    const tax = parseFloat(body.tax) || 0
    if (Number.isNaN(amount) || amount < 0 || tax < 0) {
      return badRequest('Importe no válido')
    }

    const invoice = await createInvoice(business.id, {
      ...body,
      amount,
      tax,
      invoice_number: body.invoice_number || `INV-${Date.now()}`,
    })
    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(req) {
  try {
    const { business } = await requireBusiness(req)
    const body = await req.json()

    if (!body.id) {
      return badRequest('Falta el id de la factura')
    }

    const amount = parseFloat(body.amount)
    const tax = parseFloat(body.tax) || 0
    if (Number.isNaN(amount) || amount < 0 || tax < 0) {
      return badRequest('Importe no válido')
    }

    const existing = await getInvoice(body.id, business.id)
    if (!existing) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }
    if (existing.status === 'paid' && (amount !== existing.amount || tax !== existing.tax)) {
      return badRequest('No se puede modificar el importe de una factura ya cobrada')
    }

    const invoice = await updateInvoice(body.id, business.id, { ...body, amount, tax })
    if (!invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }
    return NextResponse.json(invoice)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(req) {
  try {
    const { business } = await requireBusiness(req)
    const id = new URL(req.url).searchParams.get('id')

    if (!id) {
      return badRequest('Falta el id de la factura')
    }

    const deleted = await deleteInvoice(id, business.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
