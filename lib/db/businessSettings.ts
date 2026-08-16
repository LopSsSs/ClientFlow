import { sql } from '@/lib/neon'
import { TAX_BY_COUNTRY, DEFAULT_COUNTRY, getTaxData } from '@/lib/constants/taxByCountry'

export interface BusinessSettings {
  id: string
  business_id: string
  logo_url: string | null
  color_primary: string
  color_secondary: string
  company_name: string | null
  company_address: string | null
  company_phone: string | null
  company_email: string | null
  company_cif: string | null
  payment_paypal_email: string | null
  payment_bizum_phone: string | null
  payment_transfer_enabled: boolean
  payment_transfer_iban: string | null
  invoice_terms_text: string | null
  country: string
  currency: string
  tax_name: string
  tax_rate: number
  created_at: string
  updated_at: string
}

export interface BusinessSettingsInput {
  logo_url?: string | null
  color_primary?: string | null
  color_secondary?: string | null
  company_name?: string | null
  company_address?: string | null
  company_phone?: string | null
  company_email?: string | null
  company_cif?: string | null
  payment_paypal_email?: string | null
  payment_bizum_phone?: string | null
  payment_transfer_enabled?: boolean | null
  payment_transfer_iban?: string | null
  invoice_terms_text?: string | null
  country?: string | null
}

export async function getBusinessSettings(businessId: string): Promise<BusinessSettings | undefined> {
  const result = await sql<BusinessSettings[]>`
    SELECT * FROM business_settings WHERE business_id = ${businessId}
  `
  return result[0]
}

// Upsert: un negocio solo tiene una fila de settings (UNIQUE business_id).
// El país determina moneda/nombre/tipo de impuesto automáticamente — no se
// aceptan del cliente para evitar que un negocio se autoasigne un tipo
// incorrecto.
export async function upsertBusinessSettings(
  businessId: string,
  data: BusinessSettingsInput
): Promise<BusinessSettings> {
  const country = data.country && TAX_BY_COUNTRY[data.country] ? data.country : DEFAULT_COUNTRY
  const taxData = getTaxData(country)

  const result = await sql<BusinessSettings[]>`
    INSERT INTO business_settings (
      business_id, logo_url, color_primary, color_secondary,
      company_name, company_address, company_phone, company_email, company_cif,
      payment_paypal_email, payment_bizum_phone, payment_transfer_enabled, payment_transfer_iban,
      invoice_terms_text, country, currency, tax_name, tax_rate, updated_at
    ) VALUES (
      ${businessId}, ${data.logo_url ?? null}, ${data.color_primary || '#FF6B35'}, ${data.color_secondary || '#1f2937'},
      ${data.company_name ?? null}, ${data.company_address ?? null}, ${data.company_phone ?? null},
      ${data.company_email ?? null}, ${data.company_cif ?? null},
      ${data.payment_paypal_email ?? null}, ${data.payment_bizum_phone ?? null},
      ${data.payment_transfer_enabled ?? false}, ${data.payment_transfer_iban ?? null},
      ${data.invoice_terms_text ?? null}, ${country}, ${taxData.currency}, ${taxData.name}, ${taxData.rate}, NOW()
    )
    ON CONFLICT (business_id) DO UPDATE SET
      logo_url = EXCLUDED.logo_url,
      color_primary = EXCLUDED.color_primary,
      color_secondary = EXCLUDED.color_secondary,
      company_name = EXCLUDED.company_name,
      company_address = EXCLUDED.company_address,
      company_phone = EXCLUDED.company_phone,
      company_email = EXCLUDED.company_email,
      company_cif = EXCLUDED.company_cif,
      payment_paypal_email = EXCLUDED.payment_paypal_email,
      payment_bizum_phone = EXCLUDED.payment_bizum_phone,
      payment_transfer_enabled = EXCLUDED.payment_transfer_enabled,
      payment_transfer_iban = EXCLUDED.payment_transfer_iban,
      invoice_terms_text = EXCLUDED.invoice_terms_text,
      country = EXCLUDED.country,
      currency = EXCLUDED.currency,
      tax_name = EXCLUDED.tax_name,
      tax_rate = EXCLUDED.tax_rate,
      updated_at = NOW()
    RETURNING *
  `
  // INSERT ... ON CONFLICT DO UPDATE ... RETURNING siempre devuelve una fila.
  return result[0]!
}
