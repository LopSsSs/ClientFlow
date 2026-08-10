import { createUser, createBusiness } from '@/lib/neon'
import { startTrial, getSubscription } from '@/lib/db/subscriptions'
import { sendVerificationEmail } from '@/services/auth/emailVerification.service'
import { isSupportedLocale, DEFAULT_LOCALE } from '@/types/i18n'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email, password, businessName, locale } = await req.json()

    if (!email || !password || !businessName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await createUser(email, hashedPassword)

    // Create business
    const business = await createBusiness(user.id, { name: businessName })

    await startTrial(user.id)
    const subscription = await getSubscription(user.id)

    // El correo de verificación es un efecto secundario: si el proveedor falla,
    // no debe impedir que la cuenta quede creada (el usuario puede reenviarlo luego).
    try {
      await sendVerificationEmail({
        userId: user.id,
        email: user.email,
        companyName: business.name,
        locale: isSupportedLocale(locale) ? locale : DEFAULT_LOCALE,
      })
    } catch (emailError) {
      console.error('Verification email error:', emailError)
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Return with cookie
    const response = NextResponse.json(
      { user, business, subscription },
      { status: 201 }
    )

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('Signup error:', error)
    
    if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    // No exponer detalles internos (BD, stack) al navegador
    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 500 }
    )
  }
}
