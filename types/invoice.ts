export type InvoiceStatus = 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  business_id: string
  client_id: string
  job_id: string | null
  invoice_number: string
  amount: number
  tax: number
  status: InvoiceStatus
  due_date: string | null
  sent_date: string | null
  paid_date: string | null
  invoice_url: string | null
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  last_reminder_bucket: string | null
  last_reminder_sent_at: string | null
  created_at: string
  updated_at: string
}

// Forma que devuelven las consultas con JOIN a clients (lib/neon.js getInvoices/getInvoice).
export interface InvoiceWithClient extends Invoice {
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  client_address: string | null
}

export interface InvoiceInput {
  client_id: string
  job_id?: string | null
  invoice_number: string
  amount: number
  tax?: number
  status?: InvoiceStatus
  due_date?: string | null
  sent_date?: string | null
  paid_date?: string | null
  invoice_url?: string | null
}
