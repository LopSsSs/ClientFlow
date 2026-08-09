import { sql } from '@/lib/neon'
import type { RecurringJob, RecurringJobInput, RecurringJobWithClient } from '@/types/recurringJob'

export async function createRecurringJob(
  businessId: string,
  data: RecurringJobInput
): Promise<RecurringJob> {
  const result = await sql<RecurringJob[]>`
    INSERT INTO recurring_jobs (
      business_id, client_id, title, description, service_type, duration_hours,
      materials_cost, labor_cost, total_amount, frequency, next_run_date, created_at, updated_at
    )
    VALUES (
      ${businessId}, ${data.client_id}, ${data.title}, ${data.description || null}, ${data.service_type || null},
      ${data.duration_hours || 0}, ${data.materials_cost || 0}, ${data.labor_cost}, ${data.total_amount},
      ${data.frequency}, ${data.next_run_date}, NOW(), NOW()
    )
    RETURNING *
  `
  return result[0]!
}

export async function getRecurringJobs(businessId: string): Promise<RecurringJobWithClient[]> {
  return sql<RecurringJobWithClient[]>`
    SELECT r.*, c.name AS client_name
    FROM recurring_jobs r
    LEFT JOIN clients c ON c.id = r.client_id
    WHERE r.business_id = ${businessId}
    ORDER BY r.next_run_date ASC
  `
}

export async function setRecurringJobActive(
  id: string,
  businessId: string,
  active: boolean
): Promise<RecurringJob | undefined> {
  const result = await sql<RecurringJob[]>`
    UPDATE recurring_jobs SET active = ${active}, updated_at = NOW()
    WHERE id = ${id} AND business_id = ${businessId}
    RETURNING *
  `
  return result[0]
}

export async function deleteRecurringJob(id: string, businessId: string): Promise<{ id: string } | undefined> {
  const result = await sql<{ id: string }[]>`
    DELETE FROM recurring_jobs WHERE id = ${id} AND business_id = ${businessId} RETURNING id
  `
  return result[0]
}
