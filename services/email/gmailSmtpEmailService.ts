import nodemailer, { type Transporter } from 'nodemailer'
import type { EmailMessage, EmailService } from './EmailService'

// Envía por el SMTP normal de Gmail (smtp.gmail.com), autenticado con una
// "contraseña de aplicación" de la cuenta — no la contraseña real de Google.
// A diferencia de Resend en modo sandbox, esto entrega a cualquier
// destinatario sin necesidad de verificar un dominio propio, y es gratis
// (dentro del límite de envíos diarios de una cuenta de Gmail normal).
export class GmailSmtpEmailService implements EmailService {
  private transporter: Transporter
  private fromAddress: string

  constructor(user: string, appPassword: string) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass: appPassword },
    })
    this.fromAddress = `ClientFlow <${user}>`
  }

  async send(message: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: message.to,
      subject: message.subject,
      html: message.html,
      attachments: message.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
      })),
    })
  }
}
