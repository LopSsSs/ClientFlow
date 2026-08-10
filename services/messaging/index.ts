import type { MessagingService } from './MessagingService'
import { MakeMessagingService } from './makeMessagingService'
import { TwilioMessagingService } from './twilioMessagingService'
import { ConsoleMessagingService } from './consoleMessagingService'

let cachedService: MessagingService | null = null

export function isMessagingConfigured(): boolean {
  return Boolean(
    process.env.MAKE_WHATSAPP_WEBHOOK_URL ||
      (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  )
}

export function getMessagingService(): MessagingService {
  if (!cachedService) {
    const makeWebhookUrl = process.env.MAKE_WHATSAPP_WEBHOOK_URL
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (makeWebhookUrl) {
      cachedService = new MakeMessagingService(makeWebhookUrl)
    } else if (accountSid && authToken) {
      cachedService = new TwilioMessagingService(
        accountSid,
        authToken,
        process.env.TWILIO_SMS_FROM,
        process.env.TWILIO_WHATSAPP_FROM
      )
    } else {
      cachedService = new ConsoleMessagingService()
    }
  }
  return cachedService
}

export type { MessageChannel, OutboundMessage, MessagingService } from './MessagingService'
