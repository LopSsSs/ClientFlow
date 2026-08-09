export type MessageChannel = 'sms' | 'whatsapp'
export type MessageLogStatus = 'sent' | 'failed' | 'skipped_not_configured'

export interface MessageLogEntry {
  id: string
  business_id: string
  channel: MessageChannel
  template_type: string
  related_type: 'job' | 'invoice'
  related_id: string
  to_number: string
  status: MessageLogStatus
  error: string | null
  created_at: string
}
