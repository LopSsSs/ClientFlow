'use client'

import { useLocaleStore } from '@/store/useLocaleStore'
import { translate, type TranslationKey } from '@/utils/i18n'

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)

  const t = (key: TranslationKey, vars?: Record<string, string>) => translate(locale, key, vars)

  return { t, locale, setLocale }
}
