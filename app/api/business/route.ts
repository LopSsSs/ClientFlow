import { NextRequest, NextResponse } from 'next/server'
import { updateBusiness } from '@/lib/neon'
import { requireBusiness, errorResponse, badRequest } from '@/lib/auth'
import type { BusinessInput } from '@/types/business'

export async function PUT(req: NextRequest) {
  try {
    const { userId, business } = await requireBusiness(req)
    const body: Partial<BusinessInput> = await req.json()

    if (!body.name || !body.name.trim()) {
      return badRequest('El nombre del negocio es obligatorio')
    }

    let defaultHourlyRate: number | null = null
    if (body.default_hourly_rate !== undefined && body.default_hourly_rate !== null && body.default_hourly_rate !== ('' as unknown)) {
      const rate = Number(body.default_hourly_rate)
      if (Number.isNaN(rate) || rate < 0) {
        return badRequest('La tarifa por hora no es válida')
      }
      defaultHourlyRate = rate
    }

    const updated = await updateBusiness(business.id, userId, {
      name: body.name.trim(),
      phone: body.phone || null,
      whatsapp_number: body.whatsapp_number || null,
      logo_url: body.logo_url || null,
      currency: body.currency || business.currency,
      default_hourly_rate: defaultHourlyRate,
    })

    if (!updated) {
      return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    return errorResponse(error)
  }
}
