export type MessageTemplateType = 'job_reminder' | 'invoice_reminder' | 'satisfaction_survey'

export interface MessageTemplate {
  id: string
  business_id: string
  type: MessageTemplateType
  body: string
  created_at: string
  updated_at: string
}

// Variables disponibles por tipo de plantilla (para el motor de sustitución y la ayuda en UI).
export const TEMPLATE_VARIABLES: Record<MessageTemplateType, string[]> = {
  job_reminder: ['client_name', 'company_name', 'job_title', 'scheduled_date'],
  invoice_reminder: ['client_name', 'company_name', 'invoice_number', 'amount', 'due_date', 'payment_url'],
  satisfaction_survey: ['client_name', 'company_name', 'job_title', 'survey_url'],
}
