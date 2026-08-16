import { NextRequest, NextResponse } from 'next/server'
import { getBusinessSettings, upsertBusinessSettings, type BusinessSettingsInput } from '@/lib/db/businessSettings'
import { TAX_BY_COUNTRY, DEFAULT_COUNTRY, getTaxData } from '@/lib/constants/taxByCountry'
import { requireBusiness, errorResponse, badRequest } from '@/lib/auth'
import { isValidPhone } from '@/utils/phone'

export async function GET(req: NextRequest) {
  try {
    const { business } = await requireBusiness(req)

    const settings = await getBusinessSettings(business.id)
    if (settings) {
      return NextResponse.json(settings)
    }

    // Sin fila propia todavía: valores por defecto (España/IVA) para que el
    // formulario tenga algo sensato que mostrar antes del primer guardado.
    const taxData = getTaxData(DEFAULT_COUNTRY)
    return NextResponse.json({
      business_id: business.id,
      logo_url: null,
      color_primary: '#FF6B35',
      color_secondary: '#1f2937',
      company_name: business.name || null,
      company_address: null,
      company_phone: business.phone || null,
      company_email: null,
      company_cif: null,
      payment_paypal_email: null,
      payment_bizum_phone: null,
      payment_transfer_enabled: false,
      payment_transfer_iban: null,
      invoice_terms_text: null,
      country: DEFAULT_COUNTRY,
      currency: taxData.currency,
      tax_name: taxData.name,
      tax_rate: taxData.rate,
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { business } = await requireBusiness(req)
    const body: BusinessSettingsInput = await req.json()

    if (body.country && !TAX_BY_COUNTRY[body.country]) {
      return badRequest('País no soportado')
    }
    if (body.payment_bizum_phone && !isValidPhone(body.payment_bizum_phone)) {
      return badRequest('El teléfono de Bizum no tiene un formato válido')
    }
    if (body.payment_transfer_enabled && !body.payment_transfer_iban?.trim()) {
      return badRequest('Falta el IBAN para la transferencia bancaria')
    }

    const updated = await upsertBusinessSettings(business.id, body)
    return NextResponse.json(updated)
  } catch (error) {
    return errorResponse(error)
  }
}
