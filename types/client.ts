export interface Client {
  id: string
  business_id: string
  name: string
  phone: string | null
  whatsapp_number: string | null
  email: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  service_type: string | null
  notes: string | null
  last_service_date: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
}

export interface ClientInput {
  name: string
  phone?: string | null
  whatsapp_number?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  postal_code?: string | null
  service_type?: string | null
  notes?: string | null
}
