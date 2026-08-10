// Últimos `count` meses como "YYYY-MM", en orden cronológico, incluyendo el mes actual.
export function lastMonthKeys(count: number, from: Date = new Date()): string[] {
  const keys: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(from.getFullYear(), from.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys
}

export function monthLabel(monthKey: string, bcp47Locale = 'es-ES'): string {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year!, (month ?? 1) - 1, 1)
  return date.toLocaleDateString(bcp47Locale, { month: 'short', year: '2-digit' })
}
