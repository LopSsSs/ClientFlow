import type { MessagingService, OutboundMessage } from './MessagingService'

// Dispara el escenario de Make.com (webhook "Custom Webhook" -> WhatsApp Business
// Cloud). Make decide la plantilla aprobada por Meta según `metadata.templateType`;
// el número de origen es el único de WhatsApp compartido de ClientFlow.
export class MakeMessagingService implements MessagingService {
  constructor(private webhookUrl: string) {}

  async send(message: OutboundMessage): Promise<void> {
    const res = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: message.to,
        body: message.body,
        channel: message.channel,
        businessId: message.metadata?.businessId ?? null,
        templateType: message.metadata?.templateType ?? null,
        relatedType: message.metadata?.relatedType ?? null,
        relatedId: message.metadata?.relatedId ?? null,
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Make webhook error (${res.status}): ${body}`)
    }
  }
}
