'use client'

import { useBrandingStore } from '@/store/useBrandingStore'
import type { Business } from '@/types/business'

export function useBranding() {
  const branding = useBrandingStore((state) => state.branding)
  const setBranding = useBrandingStore((state) => state.setBranding)
  const resetBranding = useBrandingStore((state) => state.resetBranding)

  // El negocio autenticado es la única fuente de verdad de la marca:
  // se llama desde AuthProvider cada vez que cambia `business`.
  const syncFromBusiness = (business: Business | null) => {
    if (!business) {
      resetBranding()
      return
    }
    setBranding({
      companyName: business.name,
      logoUrl: business.logo_url,
      primaryColor: null,
    })
  }

  return { branding, syncFromBusiness, resetBranding }
}
