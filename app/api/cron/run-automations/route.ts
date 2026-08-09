import { NextRequest, NextResponse } from 'next/server'
import { runJobReminders, runInvoiceReminders } from '@/services/automation/reminders.service'
import { generateDueRecurringJobs } from '@/services/automation/recurringJobs.service'

// Disparado por un cron externo (ver vercel.json). No hay sesión de usuario aquí,
// así que la autorización es un secreto compartido en vez de la cookie de auth.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.get('authorization')
  return header === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const [jobReminders, invoiceReminders, recurringJobs] = await Promise.all([
    runJobReminders(),
    runInvoiceReminders(),
    generateDueRecurringJobs(),
  ])

  return NextResponse.json({ jobReminders, invoiceReminders, recurringJobs })
}
