import { getUserByEmail, getBusiness, registerFailedLogin, clearFailedLogins, isUserLocked } from '@/lib/neon'
import { getSubscription } from '@/lib/db/subscriptions'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Get user
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (await isUserLocked(user.id)) {
      return NextResponse.json(
        { error: 'Demasiados intentos fallidos. Inténtalo de nuevo en unos minutos.' },
        { status: 429 }
      )
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      await registerFailedLogin(user.id)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    await clearFailedLogins(user.id)

    // Get business
    const business = await getBusiness(user.id)
    const subscription = await getSubscription(user.id)

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d', algorithm: 'HS256' }
    )

    // Return with cookie
    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, email_verified: user.email_verified }, business, subscription },
      { status: 200 }
    )

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    // No exponer detalles internos (BD, stack) al navegador
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
