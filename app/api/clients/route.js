import { getClients, createClient, updateClient, deleteClient } from '@/lib/neon'
import { requireBusiness, errorResponse, badRequest } from '@/lib/auth'
import { NextResponse } from 'next/server'

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
    const { business } = await requireBusiness(req)
    const body = await req.json()

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return badRequest('El nombre del cliente es obligatorio')
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
