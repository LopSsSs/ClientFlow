import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/neon'
import { logInboundWhatsappEvent, updateOutboundMessageStatus } from '@/lib/db/automation'

// Recibe los eventos que el escenario "Watch Events" de Make.com reenvía desde
// WhatsApp Business Cloud: confirmaciones de entrega/lectura de mensajes salientes
// y respuestas nuevas de clientes. Autorización por secreto compartido (igual que
// /api/cron/run-automations) porque no hay sesión de usuario en un webhook.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.MAKE_WEBHOOK_SECRET
  if (!secret) return false
  const header = req.headers.get('authorization')
  return header === `Bearer ${secret}`
}

interface MakeWhatsappEvent {
  to_number: string
  status: 'delivered' | 'read' | 'failed' | 'received'
  provider_message_id?: string | null
  body?: string | null
}

// El número compartido no distingue negocios por sí mismo: para una respuesta
// entrante, el negocio se resuelve por el cliente al que pertenece ese teléfono.
async function findBusinessIdByPhone(phone: string): Promise<string | null> {
  const result = await sql<{ business_id: string }[]>`
    SELECT business_id FROM clients
    WHERE whatsapp_number = ${phone} OR phone = ${phone}
    LIMIT 1
  `
  return result[0]?.business_id ?? null
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const event: MakeWhatsappEvent = await req.json()

  if (event.status === 'delivered' || event.status === 'read' || event.status === 'failed') {
    if (event.provider_message_id) {
      await updateOutboundMessageStatus(event.provider_message_id, event.status)
    }
    return NextResponse.json({ ok: true })
  }

  const businessId = await findBusinessIdByPhone(event.to_number)
  if (!businessId) {
    return NextResponse.json({ ok: true, note: 'Número no asociado a ningún cliente' })
  }

  await logInboundWhatsappEvent({
    businessId,
    toNumber: event.to_number,
    status: event.status,
    body: event.body,
    providerMessageId: event.provider_message_id,
  })

  return NextResponse.json({ ok: true })
}
