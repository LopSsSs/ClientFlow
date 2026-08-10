'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/hooks/useTranslation'
import { Lock, LogOut } from 'lucide-react'

const CONTACT_EMAIL = 'david.iglesiaslopes62@gmail.com'

export default function TrialExpiredScreen() {
  const { signOut } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 text-center">
        <div className="bg-accent text-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={28} />
        </div>
        <h1 className="text-2xl font-bold text-primary mb-3">{t('trial.expiredTitle')}</h1>
        <p className="text-gray-600 mb-8">{t('trial.expiredBody')}</p>

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="btn-accent w-full py-3 font-semibold inline-block mb-3"
        >
          {t('trial.contactCta')}
        </a>
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
