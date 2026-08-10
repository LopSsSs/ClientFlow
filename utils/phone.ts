// Formato permisivo: + opcional, dígitos con separadores comunes (espacio, guion,
// paréntesis, punto). Entre 7 y 15 dígitos según el máximo E.164 (recomendación ITU-T).
const PHONE_CHARS_REGEX = /^\+?[0-9\s\-().]+$/

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed || !PHONE_CHARS_REGEX.test(trimmed)) return false

  const digits = trimmed.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}
