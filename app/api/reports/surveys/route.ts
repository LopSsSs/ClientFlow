import { NextRequest, NextResponse } from 'next/server'
import { requireBusiness, errorResponse } from '@/lib/auth'
import { getSurveySummary } from '@/lib/db/surveys'

export async function GET(req: NextRequest) {
  try {
    const { business } = await requireBusiness(req)
    const summary = await getSurveySummary(business.id)
    return NextResponse.json(summary)
  } catch (error) {
    return errorResponse(error)
  }
}
