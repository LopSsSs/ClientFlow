import { sql } from '@/lib/neon'
import type { JobPhoto, JobPhotoType } from '@/types/jobPhoto'

export async function createJobPhoto(
  jobId: string,
  businessId: string,
  type: JobPhotoType,
  url: string
): Promise<JobPhoto> {
  const result = await sql<JobPhoto[]>`
    INSERT INTO job_photos (job_id, business_id, type, url, created_at)
    VALUES (${jobId}, ${businessId}, ${type}, ${url}, NOW())
    RETURNING *
  `
  return result[0]!
}

export async function getJobPhotos(jobId: string, businessId: string): Promise<JobPhoto[]> {
  return sql<JobPhoto[]>`
    SELECT * FROM job_photos WHERE job_id = ${jobId} AND business_id = ${businessId}
    ORDER BY created_at ASC
  `
}

export async function getJobPhotoById(id: string, businessId: string): Promise<JobPhoto | undefined> {
  const result = await sql<JobPhoto[]>`
    SELECT * FROM job_photos WHERE id = ${id} AND business_id = ${businessId}
  `
  return result[0]
}

export async function deleteJobPhoto(id: string, businessId: string): Promise<void> {
  await sql`DELETE FROM job_photos WHERE id = ${id} AND business_id = ${businessId}`
}
