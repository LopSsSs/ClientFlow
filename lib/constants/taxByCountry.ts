// Impuesto y moneda por defecto al elegir un país en la configuración de
// facturas. El tipo se guarda como fracción (0.21, no 21) porque así lo
// espera lib/invoiceGenerator.js (tax_rate * 100 al mostrarlo).
export const TAX_BY_COUNTRY: Record<string, { name: string; rate: number; currency: string }> = {
  ES: { name: 'IVA', rate: 0.21, currency: 'EUR' },
  FR: { name: 'TVA', rate: 0.20, currency: 'EUR' },
  DE: { name: 'MwSt', rate: 0.19, currency: 'EUR' },
  IT: { name: 'IVA', rate: 0.22, currency: 'EUR' },
  GB: { name: 'VAT', rate: 0.20, currency: 'GBP' },
  US: { name: 'Sales Tax', rate: 0.08, currency: 'USD' },
  NL: { name: 'BTW', rate: 0.21, currency: 'EUR' },
  BE: { name: 'TVA', rate: 0.21, currency: 'EUR' },
  PT: { name: 'IVA', rate: 0.23, currency: 'EUR' },
  AT: { name: 'USt', rate: 0.20, currency: 'EUR' },
  CH: { name: 'MWST', rate: 0.077, currency: 'CHF' },
  SE: { name: 'VAT', rate: 0.25, currency: 'SEK' },
  NO: { name: 'VAT', rate: 0.25, currency: 'NOK' },
  DK: { name: 'MOMS', rate: 0.25, currency: 'DKK' },
  CZ: { name: 'DPH', rate: 0.21, currency: 'CZK' },
}

export const COUNTRY_NAMES: Record<string, string> = {
  ES: 'España',
  FR: 'Francia',
  DE: 'Alemania',
  IT: 'Italia',
  GB: 'Reino Unido',
  US: 'Estados Unidos',
  NL: 'Holanda',
  BE: 'Bélgica',
  PT: 'Portugal',
  AT: 'Austria',
  CH: 'Suiza',
  SE: 'Suecia',
  NO: 'Noruega',
  DK: 'Dinamarca',
  CZ: 'República Checa',
}

export const DEFAULT_COUNTRY = 'ES'

// Devuelve siempre un valor (nunca undefined): cae a España si el código de
// país no está en el mapa. TAX_BY_COUNTRY[DEFAULT_COUNTRY] existe por
// construcción, de ahí el `!`.
export function getTaxData(country: string): { name: string; rate: number; currency: string } {
  return TAX_BY_COUNTRY[country] ?? TAX_BY_COUNTRY[DEFAULT_COUNTRY]!
}
