import { Twilio } from 'twilio'
import type { MessagingService, OutboundMessage } from './MessagingService'

const WHATSAPP_PREFIX = 'whatsapp:'

export class TwilioMessagingService implements MessagingService {
  private client: Twilio
  private smsFrom?: string
  private whatsappFrom?: string

  constructor(accountSid: string, authToken: string, smsFrom?: string, whatsappFrom?: string) {
    this.client = new Twilio(accountSid, authToken)
    this.smsFrom = smsFrom
    this.whatsappFrom = whatsappFrom
  }

  async send(message: OutboundMessage): Promise<void> {
    const isWhatsapp = message.channel === 'whatsapp'
    const from = isWhatsapp ? this.whatsappFrom : this.smsFrom

    if (!from) {
      throw new Error(`No hay número remitente de Twilio configurado para el canal "${message.channel}"`)
    }

    await this.client.messages.create({
      to: isWhatsapp ? `${WHATSAPP_PREFIX}${message.to}` : message.to,
      from: isWhatsapp ? `${WHATSAPP_PREFIX}${from}` : from,
      body: message.body,
    })
  }
}
