import { getDueRecurringJobs, advanceRecurringJob } from '@/lib/db/automation'
import { createJob } from '@/lib/neon'
import { nextRunDate } from '@/utils/recurrence'

export async function generateDueRecurringJobs(): Promise<{ created: number }> {
  const due = await getDueRecurringJobs()

  for (const recurring of due) {
    await createJob(recurring.business_id, {
      client_id: recurring.client_id,
      title: recurring.title,
      description: recurring.description,
      status: 'pending',
      scheduled_date: recurring.next_run_date,
      service_type: recurring.service_type,
      duration_hours: recurring.duration_hours,
      materials_cost: recurring.materials_cost,
      labor_cost: recurring.labor_cost,
      total_amount: recurring.total_amount,
    })

    await advanceRecurringJob(recurring.id, nextRunDate(new Date(recurring.next_run_date), recurring.frequency))
  }

  return { created: due.length }
}
