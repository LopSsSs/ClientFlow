import { getOverdueInfo } from '@/utils/collections'
import { useTranslation } from '@/hooks/useTranslation'
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
  const { t } = useTranslation()
  const { isOverdue, daysOverdue, bucket } = getOverdueInfo(dueDate, status)

  if (!isOverdue || bucket === 'none') return null

  return (
    <span className={`badge ${BUCKET_CLASS[bucket]} ml-2`}>
      {t('overdueBadge.label', { days: String(daysOverdue) })}
    </span>
  )
}
