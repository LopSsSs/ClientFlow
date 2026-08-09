export interface SatisfactionSurvey {
  id: string
  job_id: string
  business_id: string
  client_id: string
  rating: number | null
  comment: string | null
  sent_at: string | null
  submitted_at: string | null
  created_at: string
}

export interface PublicSurveyView {
  job_id: string
  job_title: string
  company_name: string
  client_name: string
  already_submitted: boolean
}
