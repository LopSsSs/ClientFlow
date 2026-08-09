import { getJobs, getJob, createJob, updateJob, deleteJob, getClient } from '@/lib/neon'
import { requireBusiness, errorResponse, badRequest } from '@/lib/auth'
import { sendSatisfactionSurvey } from '@/services/surveys/satisfactionSurvey.service'
import { NextResponse } from 'next/server'

function parseAmounts(body) {
  const laborCost = parseFloat(body.labor_cost)
  const materialsCost = parseFloat(body.materials_cost) || 0
  // total_amount es el precio final que se cobra al cliente, independiente del
  // coste (mano de obra + materiales) — así es como se calcula el margen real.
  // No se recalcula aquí: si se recalculara como coste + 0, el margen sería
  // siempre cero.
  const totalAmount = parseFloat(body.total_amount)
  if (
    Number.isNaN(laborCost) || laborCost < 0 ||
    materialsCost < 0 ||
    Number.isNaN(totalAmount) || totalAmount < 0
  ) {
    return null
  }
  return {
    labor_cost: laborCost,
    materials_cost: materialsCost,
    duration_hours: parseFloat(body.duration_hours) || 0,
    total_amount: totalAmount,
  }
}

export async function GET(req) {
  try {
    const { business } = await requireBusiness(req)
    const status = new URL(req.url).searchParams.get('status')
    const jobs = await getJobs(business.id, status || null)
    return NextResponse.json({ data: jobs })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(req) {
  try {
    const { business } = await requireBusiness(req)
    const body = await req.json()

    if (!body.title || !body.title.trim()) {
      return badRequest('El título es obligatorio')
    }
    if (!body.client_id) {
      return badRequest('Debes seleccionar un cliente')
    }

    // El cliente debe pertenecer al negocio del usuario
    const client = await getClient(body.client_id, business.id)
    if (!client) {
      return badRequest('Cliente no válido')
    }

    const amounts = parseAmounts(body)
    if (!amounts) {
      return badRequest('Importes no válidos')
    }

    const job = await createJob(business.id, { ...body, ...amounts })
    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(req) {
  try {
    const { business } = await requireBusiness(req)
    const body = await req.json()

    if (!body.id) {
      return badRequest('Falta el id del trabajo')
    }
    if (!body.title || !body.title.trim()) {
      return badRequest('El título es obligatorio')
    }

    const amounts = parseAmounts(body)
    if (!amounts) {
      return badRequest('Importes no válidos')
    }

    const previous = await getJob(body.id, business.id)

    const job = await updateJob(body.id, business.id, { ...body, ...amounts })
    if (!job) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 })
    }

    // Se dispara la encuesta de satisfacción justo cuando el trabajo pasa a
    // "completed" por primera vez. Si falla el envío (sin Twilio, sin
    // teléfono...), no debe romper la actualización del trabajo.
    if (previous?.status !== 'completed' && job.status === 'completed') {
      try {
        await sendSatisfactionSurvey(job.id, business.id)
      } catch (surveyError) {
        console.error('Error enviando encuesta de satisfacción:', surveyError)
      }
    }

    return NextResponse.json(job)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(req) {
  try {
    const { business } = await requireBusiness(req)
    const id = new URL(req.url).searchParams.get('id')

    if (!id) {
      return badRequest('Falta el id del trabajo')
    }

    const deleted = await deleteJob(id, business.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
