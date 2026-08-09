import { NextRequest, NextResponse } from 'next/server'
import { requireBusiness, errorResponse } from '@/lib/auth'
import { buildMonthlyReport } from '@/services/reports/monthlyReport.service'

export async function GET(req: NextRequest) {
  try {
    const { business } = await requireBusiness(req)
    const monthsParam = Number(req.nextUrl.searchParams.get('months'))
    const months = Number.isFinite(monthsParam) && monthsParam > 0 ? Math.min(monthsParam, 24) : 6

    const report = await buildMonthlyReport(business.id, months)
    return NextResponse.json(report)
  } catch (error) {
    return errorResponse(error)
  }
}
