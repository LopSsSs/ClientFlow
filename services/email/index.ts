import type { EmailService } from './EmailService'
import { ResendEmailService } from './resendEmailService'
import { ConsoleEmailService } from './consoleEmailService'

let cachedService: EmailService | null = null

export function getEmailService(): EmailService {
  if (!cachedService) {
    const apiKey = process.env.RESEND_API_KEY
    cachedService = apiKey ? new ResendEmailService(apiKey) : new ConsoleEmailService()
  }
  return cachedService
}

export type { EmailMessage, EmailService } from './EmailService'
