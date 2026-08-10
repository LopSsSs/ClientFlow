import {
  getJobsNeedingReminder,
  markJobReminderSent,
  getOverdueInvoiceCandidates,
  markInvoiceReminderSent,
  logMessage,
} from '@/lib/db/automation'
import { getMessagingService, isMessagingConfigured } from '@/services/messaging'
import { renderTemplateFor } from '@/services/messaging/templates'
import { pickRecipient } from './recipient'
import { getOverdueInfo } from '@/utils/collections'
import type { InvoiceStatus } from '@/types/invoice'

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export async function runJobReminders(): Promise<{ sent: number; skipped: number }> {
  const candidates = await getJobsNeedingReminder()
  const messaging = getMessagingService()
  let sent = 0
  let skipped = 0

  for (const job of candidates) {
    const recipient = pickRecipient(job.client_whatsapp, job.client_phone)
    if (!recipient) {
      skipped += 1
      continue
    }

    const body = await renderTemplateFor(job.business_id, 'job_reminder', {
      client_name: job.client_name,
      company_name: job.company_name,
      job_title: job.title,
      scheduled_date: new Date(job.scheduled_date).toLocaleDateString('es-ES'),
    })

    try {
      await messaging.send({
        to: recipient.to,
        body,
        channel: recipient.channel,
        metadata: {
          businessId: job.business_id,
          templateType: 'job_reminder',
          relatedType: 'job',
          relatedId: job.id,
        },
      })
      await logMessage({
        businessId: job.business_id,
        channel: recipient.channel,
        templateType: 'job_reminder',
        relatedType: 'job',
        relatedId: job.id,
        toNumber: recipient.to,
        status: isMessagingConfigured() ? 'sent' : 'skipped_not_configured',
      })
      await markJobReminderSent(job.id)
      sent += 1
    } catch (error) {
      await logMessage({
        businessId: job.business_id,
        channel: recipient.channel,
        templateType: 'job_reminder',
        relatedType: 'job',
        relatedId: job.id,
        toNumber: recipient.to,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  return { sent, skipped }
}

export async function runInvoiceReminders(): Promise<{ sent: number; skipped: number }> {
  const candidates = await getOverdueInvoiceCandidates()
  const messaging = getMessagingService()
  let sent = 0
  let skipped = 0

  for (const invoice of candidates) {
    const { bucket } = getOverdueInfo(invoice.due_date, invoice.status as InvoiceStatus)
    if (bucket === 'none' || bucket === invoice.last_reminder_bucket) {
      continue
    }

    const recipient = pickRecipient(invoice.client_whatsapp, invoice.client_phone)
    if (!recipient) {
      skipped += 1
      continue
    }

    const body = await renderTemplateFor(invoice.business_id, 'invoice_reminder', {
      client_name: invoice.client_name,
      company_name: invoice.company_name,
      invoice_number: invoice.invoice_number,
      amount: `${(invoice.amount + invoice.tax).toFixed(2)}€`,
      due_date: new Date(invoice.due_date).toLocaleDateString('es-ES'),
      payment_url: `${getAppUrl()}/pay/${invoice.id}`,
    })

    try {
      await messaging.send({
        to: recipient.to,
        body,
        channel: recipient.channel,
        metadata: {
          businessId: invoice.business_id,
          templateType: 'invoice_reminder',
          relatedType: 'invoice',
          relatedId: invoice.id,
        },
      })
      await logMessage({
        businessId: invoice.business_id,
        channel: recipient.channel,
        templateType: 'invoice_reminder',
        relatedType: 'invoice',
        relatedId: invoice.id,
        toNumber: recipient.to,
        status: isMessagingConfigured() ? 'sent' : 'skipped_not_configured',
      })
      await markInvoiceReminderSent(invoice.id, bucket)
      sent += 1
    } catch (error) {
      await logMessage({
        businessId: invoice.business_id,
        channel: recipient.channel,
        templateType: 'invoice_reminder',
        relatedType: 'invoice',
        relatedId: invoice.id,
        toNumber: recipient.to,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  return { sent, skipped }
}
