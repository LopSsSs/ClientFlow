'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBranding } from '@/hooks/useBranding'
import { useLocaleStore } from '@/store/useLocaleStore'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [business, setBusiness] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { syncFromBusiness } = useBranding()
  const locale = useLocaleStore((state) => state.locale)

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth()
  }, [])

  useEffect(() => {
    // El white-labeling (nombre de empresa, logo) sigue a `business` en todo momento.
    syncFromBusiness(business)
  }, [business])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const { user, business, subscription } = await res.json()
        setUser(user)
        setBusiness(business)
        setSubscription(subscription)
      }
    } catch (err) {
      console.error('Auth check error:', err)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, businessName) => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, businessName, locale }),
        credentials: 'include',
      })

      if (!res.ok) {
        const { error: errorMsg } = await res.json()
        throw new Error(errorMsg)
      }

      const { user, business, subscription } = await res.json()
      setUser(user)
      setBusiness(business)
      setSubscription(subscription)
      return { user, business }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (!res.ok) {
        const { error: errorMsg } = await res.json()
        throw new Error(errorMsg)
      }

      const { user, business, subscription } = await res.json()
      setUser(user)
      setBusiness(business)
      setSubscription(subscription)
      return { user, business }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      setBusiness(null)
      setSubscription(null)
      router.push('/')
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    user,
    business,
    subscription,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    // Permite reflejar cambios de negocio (p.ej. desde Configuración) sin recargar la sesión.
    setBusiness,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
