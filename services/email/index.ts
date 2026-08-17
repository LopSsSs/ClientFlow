import type { EmailService } from './EmailService'
import { ResendEmailService } from './resendEmailService'
import { GmailSmtpEmailService } from './gmailSmtpEmailService'
import { ConsoleEmailService } from './consoleEmailService'

let cachedService: EmailService | null = null

// Gmail SMTP tiene prioridad sobre Resend: Resend está en modo sandbox (sin
// dominio propio verificado) y solo entrega a la cuenta propietaria, así que
// solo sirve para pruebas del propio dueño. Gmail SMTP entrega a cualquier
// destinatario real sin necesidad de verificar nada.
export function getEmailService(): EmailService {
  if (!cachedService) {
    const gmailUser = process.env.GMAIL_USER
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD
    const resendApiKey = process.env.RESEND_API_KEY

    if (gmailUser && gmailAppPassword) {
      cachedService = new GmailSmtpEmailService(gmailUser, gmailAppPassword)
    } else if (resendApiKey) {
      cachedService = new ResendEmailService(resendApiKey)
    } else {
      cachedService = new ConsoleEmailService()
    }
  }
  return cachedService
}

export type { EmailMessage, EmailService } from './EmailService'
