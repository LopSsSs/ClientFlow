import type { MessagingService } from './MessagingService'
import { TwilioMessagingService } from './twilioMessagingService'
import { ConsoleMessagingService } from './consoleMessagingService'

let cachedService: MessagingService | null = null

export function isMessagingConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
}

export function getMessagingService(): MessagingService {
  if (!cachedService) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    cachedService =
      accountSid && authToken
        ? new TwilioMessagingService(
            accountSid,
            authToken,
            process.env.TWILIO_SMS_FROM,
            process.env.TWILIO_WHATSAPP_FROM
          )
        : new ConsoleMessagingService()
  }
  return cachedService
}

export type { MessageChannel, OutboundMessage, MessagingService } from './MessagingService'
