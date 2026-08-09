'use client'

import { Globe } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { SUPPORTED_LOCALES, type Locale } from '@/types/i18n'

const LOCALE_LABELS: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
}

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation()

  return (
    <label className="flex items-center gap-2 text-sm">
      <Globe size={16} />
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="bg-transparent border border-current/30 rounded px-2 py-1 text-inherit"
        aria-label="Idioma"
      >
        {SUPPORTED_LOCALES.map((code) => (
          <option key={code} value={code} className="text-black">
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  )
}
