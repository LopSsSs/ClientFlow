import { computeMargin } from '@/utils/margin'

interface MarginBadgeProps {
  finalPrice: number
  laborCost: number
  materialsCost: number
  currencySymbol?: string
}

function marginColorClass(marginPercent: number): string {
  if (marginPercent < 0) return 'bg-red-100 text-red-800'
  if (marginPercent < 15) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

export default function MarginBadge({
  finalPrice,
  laborCost,
  materialsCost,
  currencySymbol = '€',
}: MarginBadgeProps) {
  const { margin, marginPercent } = computeMargin(finalPrice, laborCost, materialsCost)

  return (
    <span className={`badge ${marginColorClass(marginPercent)}`}>
      {currencySymbol}
      {margin.toFixed(2)} ({marginPercent.toFixed(0)}%)
    </span>
  )
}
