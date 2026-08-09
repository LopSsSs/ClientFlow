import { create } from 'zustand'
import type { BrandingConfig } from '@/types/business'

const DEFAULT_BRANDING: BrandingConfig = {
  companyName: 'ClientFlow',
  logoUrl: null,
  primaryColor: null,
}

interface BrandingState {
  branding: BrandingConfig
  // No se persiste: la marca real llega de `business` (AuthContext) en cada sesión;
  // persistirla arriesgaría mostrar el nombre de otra empresa en un dispositivo compartido.
  setBranding: (branding: Partial<BrandingConfig>) => void
  resetBranding: () => void
}

export const useBrandingStore = create<BrandingState>()((set) => ({
  branding: DEFAULT_BRANDING,
  setBranding: (partial) =>
    set((state) => ({ branding: { ...state.branding, ...partial } })),
  resetBranding: () => set({ branding: DEFAULT_BRANDING }),
}))
