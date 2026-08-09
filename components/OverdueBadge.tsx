import { getOverdueInfo } from '@/utils/collections'
import type { InvoiceStatus } from '@/types/invoice'

interface OverdueBadgeProps {
  dueDate: string | null
  status: InvoiceStatus
}

const BUCKET_CLASS: Record<string, string> = {
  mild: 'badge-pending',
  warning: 'badge-warning',
  severe: 'badge-error',
}

export default function OverdueBadge({ dueDate, status }: OverdueBadgeProps) {
  const { isOverdue, daysOverdue, bucket } = getOverdueInfo(dueDate, status)

  if (!isOverdue || bucket === 'none') return null

  return (
    <span className={`badge ${BUCKET_CLASS[bucket]} ml-2`}>
      Vencida {daysOverdue}d
    </span>
  )
}
