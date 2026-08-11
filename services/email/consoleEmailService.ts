import type { EmailMessage, EmailService } from './EmailService'

// Se usa cuando falta RESEND_API_KEY (típicamente en desarrollo local):
// deja constancia del envío en el log del servidor en vez de fallar el flujo.
export class ConsoleEmailService implements EmailService {
  async send(message: EmailMessage): Promise<void> {
    console.warn(
      `[email] RESEND_API_KEY no configurada. Simulando envío a ${message.to}: "${message.subject}"` +
        (message.attachments?.length ? ` (adjuntos: ${message.attachments.map((a) => a.filename).join(', ')})` : '')
    )
    console.info(message.html)
  }
}
