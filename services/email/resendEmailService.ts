import { Resend } from 'resend'
import type { EmailMessage, EmailService } from './EmailService'

const FROM_ADDRESS = process.env.EMAIL_FROM || 'ClientFlow <onboarding@resend.dev>'

export class ResendEmailService implements EmailService {
  private client: Resend

  constructor(apiKey: string) {
    this.client = new Resend(apiKey)
  }

  async send(message: EmailMessage): Promise<void> {
    const { error } = await this.client.emails.send({
      from: FROM_ADDRESS,
      to: message.to,
      subject: message.subject,
      html: message.html,
    })

    if (error) {
      throw new Error(`Resend error: ${error.message}`)
    }
  }
}
