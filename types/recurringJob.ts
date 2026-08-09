export type RecurrenceFrequency = 'weekly' | 'biweekly' | 'monthly'

export interface RecurringJob {
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
  frequency: RecurrenceFrequency
  next_run_date: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface RecurringJobWithClient extends RecurringJob {
  client_name: string | null
}

export interface RecurringJobInput {
  client_id: string
  title: string
  description?: string | null
  service_type?: string | null
  duration_hours?: number
  materials_cost?: number
  labor_cost: number
  total_amount: number
  frequency: RecurrenceFrequency
  next_run_date: string
}
