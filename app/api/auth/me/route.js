import { getUserById, getBusiness } from '@/lib/neon'
import { getSubscription } from '@/lib/db/subscriptions'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

export async function GET(req) {
  try {
    const token = req.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user data
    const user = await getUserById(decoded.userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get business
    const business = await getBusiness(decoded.userId)
    const subscription = await getSubscription(decoded.userId)

    return NextResponse.json({
      user: { id: user.id, email: user.email, email_verified: user.email_verified },
      business,
      subscription,
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}
