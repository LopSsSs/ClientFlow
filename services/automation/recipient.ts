import type { MessageChannel } from '@/types/messageLog'

export interface Recipient {
  channel: MessageChannel
  to: string
}

// Prioriza WhatsApp (más barato y más usado por el público de ClientFlow)
// y cae a SMS si el cliente no tiene número de WhatsApp registrado.
export function pickRecipient(whatsappNumber: string | null, phone: string | null): Recipient | null {
  if (whatsappNumber) return { channel: 'whatsapp', to: whatsappNumber }
  if (phone) return { channel: 'sms', to: phone }
  return null
}
