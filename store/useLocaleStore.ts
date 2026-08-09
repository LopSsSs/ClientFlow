import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_LOCALE, type Locale } from '@/types/i18n'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

// Persistido en localStorage: el idioma elegido sobrevive a recargas y cierres de pestaña.
// No hay routing por locale todavía (ver README de la fase de i18n), así que esta es
// la única fuente de verdad del idioma activo.
export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'clientflow-locale' }
  )
)
