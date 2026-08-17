'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/hooks/useTranslation'
import { Mail, LogOut } from 'lucide-react'

const COUNTDOWN_SECONDS = 9 * 60
const POLL_INTERVAL_MS = 5000

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function EmailNotVerifiedScreen() {
  const { user, signOut, refreshAuth } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()

  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS)
  const [resending, setResending] = useState(false)
  const [resendResult, setResendResult] = useState<'sent' | 'error' | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const tick = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(tick)
  }, [])

  // Detecta que el usuario verificó desde otra pestaña sin que tenga que
  // recargar ni volver a intentar entrar: en cuanto email_verified pasa a
  // true, el layout del dashboard deja de renderizar esta pantalla.
  useEffect(() => {
    pollRef.current = setInterval(refreshAuth, POLL_INTERVAL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [refreshAuth])

  const handleResend = async () => {
    setResending(true)
    setResendResult(null)
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST', credentials: 'include' })
      setResendResult(res.ok ? 'sent' : 'error')
      if (res.ok) setSecondsLeft(COUNTDOWN_SECONDS)
    } catch {
      setResendResult('error')
    } finally {
      setResending(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 text-center">
        <div className="bg-accent text-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail size={28} />
        </div>
        <h1 className="text-2xl font-bold text-primary mb-3">{t('emailVerification.screenTitle')}</h1>
        <p className="text-gray-600 mb-6">
          {t('emailVerification.screenBody', { email: user?.email || '' })}
        </p>

        {secondsLeft > 0 ? (
          <p className="text-3xl font-bold text-primary mb-6 tabular-nums">{formatTime(secondsLeft)}</p>
        ) : (
          <div className="mb-6">
            <p className="text-gray-600 mb-3">{t('emailVerification.screenExpired')}</p>
            <button onClick={handleResend} disabled={resending} className="btn-accent w-full">
              {resending ? '...' : t('emailVerification.resendButton')}
            </button>
            {resendResult === 'sent' && (
              <p className="text-green-700 text-sm mt-2">{t('emailVerification.resendSent')}</p>
            )}
            {resendResult === 'error' && (
              <p className="text-red-600 text-sm mt-2">{t('emailVerification.resendError')}</p>
            )}
          </div>
        )}

        <button
          onClick={handleSignOut}
          className="w-full py-3 font-medium text-gray-500 hover:text-primary flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> {t('trial.signOut')}
        </button>
      </div>
    </div>
  )
}
