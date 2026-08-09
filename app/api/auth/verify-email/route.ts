import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken } from '@/services/auth/emailVerification.service'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/auth/login?verified=missing_token`)
  }

  const result = await verifyEmailToken(token)

  if (!result.ok) {
    return NextResponse.redirect(`${APP_URL}/auth/login?verified=${result.reason}`)
  }

  return NextResponse.redirect(`${APP_URL}/auth/login?verified=ok`)
}
