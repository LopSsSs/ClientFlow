import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/neon'
import {
  createRecurringJob,
  getRecurringJobs,
  setRecurringJobActive,
  deleteRecurringJob,
} from '@/lib/db/recurringJobs'
import { requireBusiness, errorResponse, badRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { business } = await requireBusiness(req)
    const data = await getRecurringJobs(business.id)
    return NextResponse.json({ data })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { business } = await requireBusiness(req)
    const body = await req.json()

    if (!body.client_id) {
      return badRequest('Selecciona un cliente')
    }
    const client = await getClient(body.client_id, business.id)
    if (!client) {
      return badRequest('Cliente no válido')
    }
    if (!body.title) {
      return badRequest('El título es obligatorio')
    }
    if (!['weekly', 'biweekly', 'monthly'].includes(body.frequency)) {
      return badRequest('Frecuencia no válida')
    }
    if (!body.next_run_date) {
      return badRequest('Falta la fecha de inicio')
    }

    const laborCost = parseFloat(body.labor_cost)
    const totalAmount = parseFloat(body.total_amount)
    if (Number.isNaN(laborCost) || Number.isNaN(totalAmount)) {
      return badRequest('Importes no válidos')
    }

    const recurringJob = await createRecurringJob(business.id, {
      ...body,
      labor_cost: laborCost,
      total_amount: totalAmount,
      materials_cost: parseFloat(body.materials_cost) || 0,
      duration_hours: parseFloat(body.duration_hours) || 0,
    })
    return NextResponse.json(recurringJob, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { business } = await requireBusiness(req)
    const body = await req.json()

    if (!body.id) {
      return badRequest('Falta el id')
    }

    const updated = await setRecurringJobActive(body.id, business.id, Boolean(body.active))
    if (!updated) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { business } = await requireBusiness(req)
    const id = new URL(req.url).searchParams.get('id')
    if (!id) {
      return badRequest('Falta el id')
    }

    const deleted = await deleteRecurringJob(id, business.id)
    if (!deleted) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
