'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const { user, business } = await res.json()
        setUser(user)
        setBusiness(business)
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
        body: JSON.stringify({ email, password, businessName }),
        credentials: 'include',
      })

      if (!res.ok) {
        const { error: errorMsg } = await res.json()
        throw new Error(errorMsg)
      }

      const { user, business } = await res.json()
      setUser(user)
      setBusiness(business)
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

      const { user, business } = await res.json()
      setUser(user)
      setBusiness(business)
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
      router.push('/')
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    user,
    business,
    loading,
    error,
    signUp,
    signIn,
    signOut,
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
