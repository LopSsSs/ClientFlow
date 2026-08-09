import type { MessagingService, OutboundMessage } from './MessagingService'

// Se usa cuando faltan las credenciales de Twilio: deja constancia en el log
// del servidor en vez de romper el flujo de automatización (igual patrón que
// el email de verificación en Fase 1).
export class ConsoleMessagingService implements MessagingService {
  async send(message: OutboundMessage): Promise<void> {
    console.warn(
      `[messaging] Twilio no configurado. Simulando envío ${message.channel} a ${message.to}: "${message.body}"`
    )
  }
}
