export interface EmailAttachment {
  filename: string
  content: Buffer
}

export interface EmailMessage {
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
}

export interface EmailService {
  send(message: EmailMessage): Promise<void>
}
