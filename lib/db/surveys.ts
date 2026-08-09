import { sql } from '@/lib/neon'
import type { SatisfactionSurvey } from '@/types/satisfactionSurvey'

export interface SurveySendContext {
  job_id: string
  job_title: string
  business_id: string
  client_id: string
  client_name: string
  client_phone: string | null
  client_whatsapp: string | null
  company_name: string
}

export async function getSurveySendContext(
  jobId: string,
  businessId: string
): Promise<SurveySendContext | undefined> {
  const result = await sql<SurveySendContext[]>`
    SELECT j.id AS job_id, j.title AS job_title, j.business_id, c.id AS client_id,
           c.name AS client_name, c.phone AS client_phone, c.whatsapp_number AS client_whatsapp,
           b.name AS company_name
    FROM jobs j
    JOIN clients c ON c.id = j.client_id
    JOIN businesses b ON b.id = j.business_id
    WHERE j.id = ${jobId} AND j.business_id = ${businessId}
  `
  return result[0]
}

export async function upsertSurveyAsSent(
  jobId: string,
  businessId: string,
  clientId: string
): Promise<void> {
  await sql`
    INSERT INTO satisfaction_surveys (job_id, business_id, client_id, sent_at, created_at)
    VALUES (${jobId}, ${businessId}, ${clientId}, NOW(), NOW())
    ON CONFLICT (job_id) DO UPDATE SET sent_at = NOW()
  `
}

export interface PublicSurveyRow {
  job_id: string
  job_title: string
  company_name: string
  client_name: string
  submitted_at: string | null
}

export async function getPublicSurvey(jobId: string): Promise<PublicSurveyRow | undefined> {
  const result = await sql<PublicSurveyRow[]>`
    SELECT j.id AS job_id, j.title AS job_title, b.name AS company_name, c.name AS client_name,
           s.submitted_at
    FROM jobs j
    JOIN clients c ON c.id = j.client_id
    JOIN businesses b ON b.id = j.business_id
    LEFT JOIN satisfaction_surveys s ON s.job_id = j.id
    WHERE j.id = ${jobId}
  `
  return result[0]
}

export async function submitSurvey(
  jobId: string,
  rating: number,
  comment: string | null
): Promise<SatisfactionSurvey | undefined> {
  const result = await sql<SatisfactionSurvey[]>`
    UPDATE satisfaction_surveys
    SET rating = ${rating}, comment = ${comment}, submitted_at = NOW()
    WHERE job_id = ${jobId} AND submitted_at IS NULL
    RETURNING *
  `
  return result[0]
}

export interface SurveySummary {
  averageRating: number
  totalResponses: number
  recent: { client_name: string; rating: number; comment: string | null; submitted_at: string }[]
}

export async function getSurveySummary(businessId: string): Promise<SurveySummary> {
  const [stats] = await sql<{ avg: number | null; total: number }[]>`
    SELECT AVG(rating)::float AS avg, COUNT(*)::int AS total
    FROM satisfaction_surveys
    WHERE business_id = ${businessId} AND submitted_at IS NOT NULL
  `

  const recent = await sql<SurveySummary['recent']>`
    SELECT c.name AS client_name, s.rating, s.comment, s.submitted_at
    FROM satisfaction_surveys s
    JOIN clients c ON c.id = s.client_id
    WHERE s.business_id = ${businessId} AND s.submitted_at IS NOT NULL
    ORDER BY s.submitted_at DESC
    LIMIT 5
  `

  return {
    averageRating: stats?.avg || 0,
    totalResponses: stats?.total || 0,
    recent,
  }
}
