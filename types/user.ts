export interface User {
  id: string
  email: string
  created_at: string
  email_verified: boolean
}

// Fila cruda de la tabla `users`, incluye el hash: nunca debe salir de la capa de datos/servicios.
export interface UserRecord extends User {
  password_hash: string
}

export interface AuthenticatedUser {
  userId: string
  email: string
}
