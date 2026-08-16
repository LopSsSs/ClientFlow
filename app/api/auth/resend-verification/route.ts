import { NextRequest, NextResponse } from 'next/server'
import { requireBusiness, errorResponse } from '@/lib/auth'
import { sendVerificationEmail } from '@/services/auth/emailVerification.service'
import { isSupportedLocale, DEFAULT_LOCALE } from '@/types/i18n'

export async function POST(req: NextRequest) {
  try {
    const { userId, email, business } = await requireBusiness(req)
    const requestedLocale = req.nextUrl.searchParams.get('locale') || ''
    const locale = isSupportedLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE

    // El envío es un efecto secundario que puede fallar por causas ajenas al
    // usuario (p.ej. Resend en modo sandbox, sin dominio verificado): se
    // informa con un error controlado en vez de un 500 en bruto.
    try {
      await sendVerificationEmail({
        userId,
        email,
        companyName: business.name,
        locale,
      })
    } catch (emailError) {
      console.error('Error reenviando email de verificación:', emailError)
      return NextResponse.json({ sent: false }, { status: 502 })
    }

    return NextResponse.json({ sent: true })
  } catch (error) {
    return errorResponse(error)
  }
}
