import es from '@/locales/es.json'
import en from '@/locales/en.json'
import de from '@/locales/de.json'
import fr from '@/locales/fr.json'
import type { Locale } from '@/types/i18n'

export type Dictionary = typeof es

const DICTIONARIES: Record<Locale, Dictionary> = { es, en, de, fr }

// Genera uniones de tipo "auth.loginTitle" | "emailVerification.subject" | ...
// a partir de la forma del diccionario, para que las claves de traducción se
// validen en tiempo de compilación en vez de fallar en runtime.
type DotPath<T, Prefix extends string = ''> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: DotPath<T[K], `${Prefix}${Prefix extends '' ? '' : '.'}${K}`>
    }[keyof T & string]

export type TranslationKey = DotPath<Dictionary>

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}

const BCP47_BY_LOCALE: Record<Locale, string> = {
  es: 'es-ES',
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
}

// Para pasar a Date#toLocaleDateString y similares: la tienda de locale
// solo guarda el código corto ('es'), no la etiqueta BCP47 completa.
export function toBCP47(locale: Locale): string {
  return BCP47_BY_LOCALE[locale]
}

function resolve(dictionary: Dictionary, key: string): string {
  const value = key.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object' && segment in acc) {
      return (acc as Record<string, unknown>)[segment]
    }
    return undefined
  }, dictionary)

  return typeof value === 'string' ? value : key
}

function interpolate(template: string, vars?: Record<string, string>): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) => vars[name] ?? match)
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string>
): string {
  const template = resolve(getDictionary(locale), key)
  return interpolate(template, vars)
}
