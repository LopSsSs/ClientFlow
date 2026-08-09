export type JobPhotoType = 'before' | 'after'

export interface JobPhoto {
  id: string
  job_id: string
  business_id: string
  type: JobPhotoType
  url: string
  caption: string | null
  created_at: string
}
