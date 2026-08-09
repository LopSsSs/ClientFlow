export interface MarginBreakdown {
  margin: number
  marginPercent: number
}

// Margen real = Precio final - Mano de obra - Materiales.
// El % se expresa sobre el precio final (no sobre el coste), que es como
// se suele leer un margen comercial.
export function computeMargin(
  finalPrice: number,
  laborCost: number,
  materialsCost: number
): MarginBreakdown {
  const margin = finalPrice - laborCost - materialsCost
  const marginPercent = finalPrice > 0 ? (margin / finalPrice) * 100 : 0
  return { margin, marginPercent }
}
