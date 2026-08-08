import { getDashboardStats } from '@/lib/neon'
import { requireBusiness, errorResponse } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const { business } = await requireBusiness(req)
    const stats = await getDashboardStats(business.id)
    return NextResponse.json(stats)
  } catch (error) {
    return errorResponse(error)
  }
}
