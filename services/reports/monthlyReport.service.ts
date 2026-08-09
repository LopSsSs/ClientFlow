import { getMonthlyRevenue, getMonthlyJobStats } from '@/lib/db/reports'
import { lastMonthKeys } from '@/utils/months'

export interface MonthlyReportRow {
  month: string
  revenue: number
  margin: number
  hours: number
}

export interface MonthlyReport {
  months: MonthlyReportRow[]
  totals: {
    revenue: number
    margin: number
    marginPercent: number
    hours: number
  }
}

export async function buildMonthlyReport(businessId: string, monthsCount: number): Promise<MonthlyReport> {
  const since = new Date()
  since.setMonth(since.getMonth() - (monthsCount - 1))
  since.setDate(1)

  const [revenueRows, jobRows] = await Promise.all([
    getMonthlyRevenue(businessId, since),
    getMonthlyJobStats(businessId, since),
  ])

  const revenueByMonth = new Map(revenueRows.map((r) => [r.month, r.revenue]))
  const jobStatsByMonth = new Map(jobRows.map((r) => [r.month, r]))

  const months: MonthlyReportRow[] = lastMonthKeys(monthsCount).map((month) => ({
    month,
    revenue: revenueByMonth.get(month) || 0,
    margin: jobStatsByMonth.get(month)?.margin || 0,
    hours: jobStatsByMonth.get(month)?.hours || 0,
  }))

  const totals = months.reduce(
    (acc, m) => ({
      revenue: acc.revenue + m.revenue,
      margin: acc.margin + m.margin,
      hours: acc.hours + m.hours,
    }),
    { revenue: 0, margin: 0, hours: 0 }
  )

  return {
    months,
    totals: {
      ...totals,
      marginPercent: totals.revenue > 0 ? (totals.margin / totals.revenue) * 100 : 0,
    },
  }
}
