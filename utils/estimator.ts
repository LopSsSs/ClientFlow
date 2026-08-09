// Estimador simple: mano de obra sugerida = horas x tarifa/hora del negocio.
export function estimateLaborCost(hours: number, hourlyRate: number): number {
  if (!Number.isFinite(hours) || !Number.isFinite(hourlyRate)) return 0
  return Math.max(0, hours) * Math.max(0, hourlyRate)
}
