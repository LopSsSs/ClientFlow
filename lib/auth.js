import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { getBusiness } from '@/lib/neon'
import { getSubscription } from '@/lib/db/subscriptions'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// Verifica el JWT de la cookie y devuelve el usuario y su negocio.
// Toda ruta protegida debe pasar por aquí: garantiza que las consultas
// posteriores se limiten al negocio del usuario autenticado.
export async function requireBusiness(req) {
  const token = req.cookies.get('auth-token')?.value
  if (!token) {
    throw new ApiError('No autenticado', 401)
  }

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new ApiError('Sesión inválida o expirada', 401)
  }

  const business = await getBusiness(decoded.userId)
  if (!business) {
    throw new ApiError('Negocio no encontrado', 404)
  }

  const subscription = await getSubscription(decoded.userId)
  if (
    subscription?.status === 'trialing' &&
    subscription.current_period_end &&
    new Date(subscription.current_period_end) < new Date()
  ) {
    throw new ApiError('Tu prueba gratuita ha terminado', 402)
  }

  return { userId: decoded.userId, email: decoded.email, business }
}

// Convierte errores en respuestas JSON sin filtrar detalles internos:
// los errores inesperados (500) van al log del servidor, no al navegador.
export function errorResponse(error) {
  const status = error.status || 500
  if (status === 500) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status })
  }
  return NextResponse.json({ error: error.message }, { status })
}

export function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 })
}
