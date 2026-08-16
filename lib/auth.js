import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { getBusiness, getUserById } from '@/lib/neon'
import { isTrialExpired } from '@/lib/db/subscriptions'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// Único punto que decodifica el JWT de la cookie. El algoritmo se fija
// explícitamente a HS256 (el único que usamos para firmar): sin esto,
// jsonwebtoken acepta cualquier algoritmo presente en el token, lo cual
// es una vulnerabilidad conocida de confusión de algoritmo.
export function verifyAuthToken(req) {
  const token = req.cookies.get('auth-token')?.value
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
  } catch {
    return null
  }
}

// Verifica el JWT de la cookie y devuelve el usuario y su negocio, sin exigir
// email verificado ni prueba vigente. Solo la usan las rutas que un usuario
// recién registrado (aún sin verificar) debe poder llamar igualmente, como
// reenviar el email de verificación.
export async function requireAuthenticatedUser(req) {
  const decoded = verifyAuthToken(req)
  if (!decoded) {
    throw new ApiError('Sesión inválida o expirada', 401)
  }

  const business = await getBusiness(decoded.userId)
  if (!business) {
    throw new ApiError('Negocio no encontrado', 404)
  }

  return { userId: decoded.userId, email: decoded.email, business }
}

// Verifica el JWT de la cookie y devuelve el usuario y su negocio. Toda ruta
// protegida del uso real de la app debe pasar por aquí: además de resolver
// el negocio, bloquea el acceso si el email no está verificado o si la
// prueba gratuita terminó.
export async function requireBusiness(req) {
  const { userId, email, business } = await requireAuthenticatedUser(req)

  const user = await getUserById(userId)
  if (!user?.email_verified) {
    throw new ApiError('Verifica tu correo electrónico para continuar', 403)
  }

  if (await isTrialExpired(userId)) {
    throw new ApiError('Tu prueba gratuita ha terminado', 402)
  }

  return { userId, email, business }
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
