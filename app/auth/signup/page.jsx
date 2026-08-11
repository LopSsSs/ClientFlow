'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Building2 } from 'lucide-react'
import { useNotification } from '@/store/notificationStore'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signUp } = useAuth()
  const router = useRouter()
  const { notifyEmail, notifySuccess, notifyError } = useNotification()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { emailSent } = await signUp(email, password, businessName)
      if (emailSent) {
        notifyEmail(email)
      } else {
        notifyError('Cuenta creada, pero no pudimos enviar el email de verificación. Podrás reenviarlo desde Ajustes.')
      }
      notifySuccess('Cuenta creada correctamente')
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-accent text-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">CF</span>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">ClientFlow</h1>
          <p className="text-gray-600">Crea tu cuenta ahora</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Nombre del Negocio
            </label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2">
              <Building2 size={20} className="text-gray-400" />
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Mi Jardinería"
                className="flex-1 outline-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Email
            </label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2">
              <Mail size={20} className="text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 outline-none bg-transparent"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Contraseña
            </label>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2">
              <Lock size={20} className="text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 outline-none bg-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Mínimo 8 caracteres
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-accent py-3 font-semibold disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Al registrarte aceptas nuestros{' '}
          <Link href="/terms" className="text-accent hover:underline">términos de servicio</Link>{' '}
          y{' '}
          <Link href="/privacy" className="text-accent hover:underline">política de privacidad</Link>
        </p>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-accent font-medium hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
