import type { RecurrenceFrequency } from '@/types/recurringJob'

// Fecha del próximo trabajo generado a partir de una plantilla recurrente.
export function nextRunDate(from: Date, frequency: RecurrenceFrequency): Date {
  const next = new Date(from)
  if (frequency === 'weekly') {
    next.setDate(next.getDate() + 7)
  } else if (frequency === 'biweekly') {
    next.setDate(next.getDate() + 14)
  } else {
    next.setMonth(next.getMonth() + 1)
  }
  return next
}
