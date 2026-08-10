import { sql } from '@/lib/neon'
import type { MessageChannel, MessageLogStatus } from '@/types/messageLog'

export interface JobReminderCandidate {
  id: string
  business_id: string
  title: string
  scheduled_date: string
  client_name: string
  client_phone: string | null
  client_whatsapp: string | null
  company_name: string
}

export async function getJobsNeedingReminder(): Promise<JobReminderCandidate[]> {
  return sql<JobReminderCandidate[]>`
    SELECT j.id, j.business_id, j.title, j.scheduled_date,
           c.name AS client_name, c.phone AS client_phone, c.whatsapp_number AS client_whatsapp,
           b.name AS company_name
    FROM jobs j
    JOIN clients c ON c.id = j.client_id
    JOIN businesses b ON b.id = j.business_id
    WHERE j.status = 'pending'
      AND j.reminder_sent_at IS NULL
      AND j.scheduled_date IS NOT NULL
      AND j.scheduled_date BETWEEN NOW() AND NOW() + INTERVAL '48 hours'
  `
}

export async function markJobReminderSent(jobId: string): Promise<void> {
  await sql`UPDATE jobs SET reminder_sent_at = NOW() WHERE id = ${jobId}`
}

export interface InvoiceReminderCandidate {
  id: string
  business_id: string
  invoice_number: string
  amount: number
  tax: number
  due_date: string
  status: string
  last_reminder_bucket: string | null
  client_name: string
  client_phone: string | null
  client_whatsapp: string | null
  company_name: string
}

export async function getOverdueInvoiceCandidates(): Promise<InvoiceReminderCandidate[]> {
  return sql<InvoiceReminderCandidate[]>`
    SELECT i.id, i.business_id, i.invoice_number, i.amount, i.tax, i.due_date, i.status,
           i.last_reminder_bucket,
           c.name AS client_name, c.phone AS client_phone, c.whatsapp_number AS client_whatsapp,
           b.name AS company_name
    FROM invoices i
    JOIN clients c ON c.id = i.client_id
    JOIN businesses b ON b.id = i.business_id
    WHERE i.status IN ('pending', 'sent')
      AND i.due_date IS NOT NULL
      AND i.due_date < CURRENT_DATE
  `
}

export async function markInvoiceReminderSent(invoiceId: string, bucket: string): Promise<void> {
  await sql`
    UPDATE invoices
    SET last_reminder_bucket = ${bucket}, last_reminder_sent_at = NOW()
    WHERE id = ${invoiceId}
  `
}

export interface DueRecurringJob {
  id: string
  business_id: string
  client_id: string
  title: string
  description: string | null
  service_type: string | null
  duration_hours: number
  materials_cost: number
  labor_cost: number
  total_amount: number
  frequency: 'weekly' | 'biweekly' | 'monthly'
  next_run_date: string
}

export async function getDueRecurringJobs(): Promise<DueRecurringJob[]> {
  return sql<DueRecurringJob[]>`
    SELECT id, business_id, client_id, title, description, service_type, duration_hours,
           materials_cost, labor_cost, total_amount, frequency, next_run_date
    FROM recurring_jobs
    WHERE active = true AND next_run_date <= CURRENT_DATE
  `
}

export async function advanceRecurringJob(id: string, next: Date): Promise<void> {
  const nextDate = next.toISOString().split('T')[0]!
  await sql`
    UPDATE recurring_jobs
    SET next_run_date = ${nextDate}, updated_at = NOW()
    WHERE id = ${id}
  `
}

export async function logMessage(entry: {
  businessId: string
  channel: MessageChannel
  templateType: string
  relatedType: 'job' | 'invoice'
  relatedId: string
  toNumber: string
  status: MessageLogStatus
  error?: string | null
}): Promise<void> {
  await sql`
    INSERT INTO message_log (business_id, channel, template_type, related_type, related_id, to_number, status, error, direction, created_at)
    VALUES (${entry.businessId}, ${entry.channel}, ${entry.templateType}, ${entry.relatedType}, ${entry.relatedId},
            ${entry.toNumber}, ${entry.status}, ${entry.error ?? null}, 'outbound', NOW())
  `
}

// Eventos que llegan desde el escenario "Watch Events" de Make.com: respuestas del
// cliente y cambios de estado de entrega. No siempre hay job/invoice asociado
// (p.ej. un cliente que responde "gracias" sin más contexto).
export async function logInboundWhatsappEvent(entry: {
  businessId: string
  toNumber: string
  status: string
  body?: string | null
  providerMessageId?: string | null
}): Promise<void> {
  await sql`
    INSERT INTO message_log (business_id, channel, template_type, to_number, status, direction, body, provider_message_id, created_at)
    VALUES (${entry.businessId}, 'whatsapp', 'inbound_event', ${entry.toNumber}, ${entry.status},
            'inbound', ${entry.body ?? null}, ${entry.providerMessageId ?? null}, NOW())
  `
}

// Correlaciona un evento de estado de entrega (sent/delivered/read/failed) de Meta
// con el mensaje saliente original, cuando Make.com nos devuelve el wamid.
export async function updateOutboundMessageStatus(
  providerMessageId: string,
  status: string
): Promise<void> {
  await sql`
    UPDATE message_log SET status = ${status}
    WHERE provider_message_id = ${providerMessageId} AND direction = 'outbound'
  `
}
