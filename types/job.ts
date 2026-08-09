export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface Job {
  id: string
  business_id: string
  client_id: string
  title: string
  description: string | null
  status: JobStatus
  scheduled_date: string | null
  completed_date: string | null
  service_type: string | null
  duration_hours: number
  materials_cost: number
  labor_cost: number
  total_amount: number
  notes: string | null
  reminder_sent_at: string | null
  created_at: string
  updated_at: string
}

// Forma que devuelven las consultas con JOIN a clients (lib/neon.js getJobs/getJob).
export interface JobWithClient extends Job {
  client_name: string | null
  client_phone: string | null
  client_email: string | null
}

export interface JobInput {
  client_id: string
  title: string
  description?: string | null
  status?: JobStatus
  scheduled_date?: string | null
  completed_date?: string | null
  service_type?: string | null
  duration_hours?: number
  materials_cost?: number
  labor_cost: number
  total_amount: number
  notes?: string | null
}
