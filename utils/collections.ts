import type { InvoiceStatus } from '@/types/invoice'

export type OverdueBucket = 'none' | 'mild' | 'warning' | 'severe'

export interface OverdueInfo {
  isOverdue: boolean
  daysOverdue: number
  bucket: OverdueBucket
}

const STATUSES_SUBJECT_TO_COLLECTIONS: InvoiceStatus[] = ['pending', 'sent']

// Cobranzas: 7/30/60 días de retraso son los umbrales que pidió el negocio
// para escalar visualmente una factura vencida.
export function getOverdueInfo(
  dueDate: string | null,
  status: InvoiceStatus,
  now: Date = new Date()
): OverdueInfo {
  if (!dueDate || !STATUSES_SUBJECT_TO_COLLECTIONS.includes(status)) {
    return { isOverdue: false, daysOverdue: 0, bucket: 'none' }
  }

  const due = new Date(dueDate)
  const daysOverdue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))

  if (daysOverdue < 7) return { isOverdue: daysOverdue > 0, daysOverdue: Math.max(daysOverdue, 0), bucket: 'none' }
  if (daysOverdue < 30) return { isOverdue: true, daysOverdue, bucket: 'mild' }
  if (daysOverdue < 60) return { isOverdue: true, daysOverdue, bucket: 'warning' }
  return { isOverdue: true, daysOverdue, bucket: 'severe' }
}
