import { NextRequest, NextResponse } from 'next/server'
import { requireAuthenticatedUser, errorResponse } from '@/lib/auth'
import { sendVerificationEmail } from '@/services/auth/emailVerification.service'
import { isSupportedLocale, DEFAULT_LOCALE } from '@/types/i18n'

export async function POST(req: NextRequest) {
  try {
    const { userId, email, business } = await requireAuthenticatedUser(req)
    const requestedLocale = req.nextUrl.searchParams.get('locale') || ''
    const locale = isSupportedLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE

    await sendVerificationEmail({
      userId,
      email,
      companyName: business.name,
      locale,
    })

    return NextResponse.json({ sent: true })
  } catch (error) {
    return errorResponse(error)
  }
}
