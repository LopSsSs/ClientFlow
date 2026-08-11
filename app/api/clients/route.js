import { getClients, createClient, updateClient, deleteClient } from '@/lib/neon'
import { requireBusiness, errorResponse, badRequest } from '@/lib/auth'
import { getSubscription } from '@/lib/db/subscriptions'
import { isValidPhone } from '@/utils/phone'
import { NextResponse } from 'next/server'

function validatePhoneFields(body) {
  if (body.phone && !isValidPhone(body.phone)) {
    return 'El teléfono no tiene un formato válido'
  }
  if (body.whatsapp_number && !isValidPhone(body.whatsapp_number)) {
    return 'El número de WhatsApp no tiene un formato válido'
  }
  return null
}

export async function GET(req) {
  try {
    const { business } = await requireBusiness(req)
    const clients = await getClients(business.id)
    return NextResponse.json({ data: clients })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(req) {
  try {
    const { userId, business } = await requireBusiness(req)
    const body = await req.json()

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return badRequest('El nombre del cliente es obligatorio')
    }

    const phoneError = validatePhoneFields(body)
    if (phoneError) {
      return badRequest(phoneError)
    }

    // max_clients null = plan sin límite (Enterprise); en cualquier otro caso
    // se bloquea la creación al llegar al tope del plan actual.
    const subscription = await getSubscription(userId)
    if (subscription?.max_clients != null) {
      const currentClients = await getClients(business.id)
      if (currentClients.length >= subscription.max_clients) {
        return NextResponse.json(
          {
            error: `Has alcanzado el límite de ${subscription.max_clients} clientes de tu plan actual. Mejora tu plan para añadir más.`,
          },
          { status: 402 }
        )
      }
    }

    const client = await createClient(business.id, body)
    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(req) {
  try {
    const { business } = await requireBusiness(req)
    const body = await req.json()

    if (!body.id) {
      return badRequest('Falta el id del cliente')
    }
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return badRequest('El nombre del cliente es obligatorio')
    }

    const phoneError = validatePhoneFields(body)
    if (phoneError) {
      return badRequest(phoneError)
    }

    const client = await updateClient(body.id, business.id, body)
    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }
    return NextResponse.json(client)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(req) {
  try {
    const { business } = await requireBusiness(req)
    const id = new URL(req.url).searchParams.get('id')

    if (!id) {
      return badRequest('Falta el id del cliente')
    }

    const deleted = await deleteClient(id, business.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
