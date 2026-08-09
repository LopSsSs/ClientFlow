import { NextRequest, NextResponse } from 'next/server'
import { requireBusiness, errorResponse } from '@/lib/auth'
import { getTodaysRoute } from '@/services/route/todaysRoute.service'

export async function GET(req: NextRequest) {
  try {
    const { business } = await requireBusiness(req)
    const jobs = await getTodaysRoute(business.id)
    return NextResponse.json({ data: jobs })
  } catch (error) {
    return errorResponse(error)
  }
}
