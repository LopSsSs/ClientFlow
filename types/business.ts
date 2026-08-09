// `Business` es la entidad de tenant: cada fila es la cuenta de un cliente de ClientFlow
// y sus campos (name, logo_url, currency...) son la fuente del white-labeling.
export interface Business {
  id: string
  user_id: string
  name: string
  phone: string | null
  whatsapp_number: string | null
  logo_url: string | null
  currency: string
  timezone: string
  default_hourly_rate: number | null
  created_at: string
  updated_at: string
}

export interface BusinessInput {
  name: string
  phone?: string | null
  whatsapp_number?: string | null
  logo_url?: string | null
  currency?: string
  timezone?: string
  default_hourly_rate?: number | null
}

// Subconjunto de Business que alimenta el store de branding (nombre, logo, colores).
export interface BrandingConfig {
  companyName: string
  logoUrl: string | null
  primaryColor: string | null
}
