import { getSurveySendContext, upsertSurveyAsSent } from '@/lib/db/surveys'
import { getMessagingService } from '@/services/messaging'
import { renderTemplateFor } from '@/services/messaging/templates'
import { pickRecipient } from '@/services/automation/recipient'

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export type SendSurveyResult =
  | { ok: true }
  | { ok: false; reason: 'job_not_found' | 'no_contact_number' }

export async function sendSatisfactionSurvey(
  jobId: string,
  businessId: string
): Promise<SendSurveyResult> {
  const context = await getSurveySendContext(jobId, businessId)
  if (!context) {
    return { ok: false, reason: 'job_not_found' }
  }

  const recipient = pickRecipient(context.client_whatsapp, context.client_phone)
  if (!recipient) {
    return { ok: false, reason: 'no_contact_number' }
  }

  const body = await renderTemplateFor(businessId, 'satisfaction_survey', {
    client_name: context.client_name,
    company_name: context.company_name,
    job_title: context.job_title,
    survey_url: `${getAppUrl()}/survey/${jobId}`,
  })

  await getMessagingService().send({ to: recipient.to, body, channel: recipient.channel })
  await upsertSurveyAsSent(jobId, businessId, context.client_id)

  return { ok: true }
}
