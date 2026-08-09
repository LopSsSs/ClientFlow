export type MessageChannel = 'sms' | 'whatsapp'

export interface OutboundMessage {
  to: string
  body: string
  channel: MessageChannel
}

export interface MessagingService {
  send(message: OutboundMessage): Promise<void>
}
