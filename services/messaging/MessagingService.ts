export type MessageChannel = 'sms' | 'whatsapp'

export interface OutboundMessage {
  to: string
  body: string
  channel: MessageChannel
  // Solo lo usa el proveedor Make: identifica business/plantilla/origen para que
  // el escenario de Make pueda elegir la plantilla de WhatsApp aprobada por Meta
  // y para poder correlacionar después el estado de entrega.
  metadata?: {
    businessId: string
    templateType: string
    relatedType: 'job' | 'invoice'
    relatedId: string
  }
}

export interface MessagingService {
  send(message: OutboundMessage): Promise<void>
}
