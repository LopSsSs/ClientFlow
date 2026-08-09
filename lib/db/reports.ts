import { sql } from '@/lib/neon'

export interface MonthlyRevenue {
  month: string
  revenue: number
}

export interface MonthlyJobStats {
  month: string
  margin: number
  jobsTotal: number
  hours: number
}

export async function getMonthlyRevenue(businessId: string, since: Date): Promise<MonthlyRevenue[]> {
  return sql<MonthlyRevenue[]>`
    SELECT to_char(date_trunc('month', paid_date), 'YYYY-MM') AS month,
           SUM(amount + tax) AS revenue
    FROM invoices
    WHERE business_id = ${businessId}
      AND status = 'paid'
      AND paid_date IS NOT NULL
      AND paid_date >= ${since.toISOString()}
    GROUP BY 1
    ORDER BY 1
  `
}

export async function getMonthlyJobStats(businessId: string, since: Date): Promise<MonthlyJobStats[]> {
  return sql<MonthlyJobStats[]>`
    SELECT to_char(date_trunc('month', COALESCE(completed_date, scheduled_date, created_at)), 'YYYY-MM') AS month,
           SUM(total_amount - labor_cost - materials_cost) AS margin,
           SUM(total_amount) AS "jobsTotal",
           SUM(COALESCE(duration_hours, 0)) AS hours
    FROM jobs
    WHERE business_id = ${businessId}
      AND COALESCE(completed_date, scheduled_date, created_at) >= ${since.toISOString()}
    GROUP BY 1
    ORDER BY 1
  `
}
