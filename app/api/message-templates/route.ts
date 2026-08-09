import { NextRequest, NextResponse } from 'next/server'
import { requireBusiness, errorResponse, badRequest } from '@/lib/auth'
import { getMessageTemplates, upsertMessageTemplate } from '@/lib/db/messageTemplates'

const VALID_TYPES = ['job_reminder', 'invoice_reminder', 'satisfaction_survey']

export async function GET(req: NextRequest) {
  try {
    const { business } = await requireBusiness(req)
    const templates = await getMessageTemplates(business.id)
    return NextResponse.json({ data: templates })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { business } = await requireBusiness(req)
    const body = await req.json()

    if (!VALID_TYPES.includes(body.type)) {
      return badRequest('Tipo de plantilla no válido')
    }
    if (!body.body || typeof body.body !== 'string' || !body.body.trim()) {
      return badRequest('El texto de la plantilla no puede estar vacío')
    }

    const template = await upsertMessageTemplate(business.id, body.type, body.body.trim())
    return NextResponse.json(template)
  } catch (error) {
    return errorResponse(error)
  }
}
