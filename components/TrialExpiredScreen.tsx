'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/hooks/useTranslation'
import { usePlanCheckout } from '@/hooks/usePlanCheckout'
import { Lock, LogOut } from 'lucide-react'
import { PLANS } from '@/lib/plans'

const CONTACT_EMAIL = 'david.iglesiaslopes62@gmail.com'

export default function TrialExpiredScreen() {
  const { signOut } = useAuth()
  const { t } = useTranslation()
  const router = useRouter()
  const { choosingPlan, error: subscribeError, choosePlan } = usePlanCheckout()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-8 text-center">
        <div className="bg-accent text-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={28} />
        </div>
        <h1 className="text-2xl font-bold text-primary mb-3">{t('trial.expiredTitle')}</h1>
        <p className="text-gray-600 mb-8">{t('trial.expiredBody')}</p>

        <div className="grid sm:grid-cols-3 gap-3 mb-6 text-left">
          {Object.values(PLANS).map((plan) => (
            <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
              <p className="font-bold text-primary">{plan.name}</p>
              <p className="text-accent font-bold text-lg mb-3">{plan.priceLabel}<span className="text-xs font-normal text-gray-500">/mes</span></p>
              <button
                onClick={() => choosePlan(plan.id)}
                disabled={choosingPlan !== null}
                className="btn-accent w-full py-2 text-sm disabled:opacity-50"
              >
                {choosingPlan === plan.id ? 'Redirigiendo...' : 'Elegir Plan'}
              </button>
            </div>
          ))}
        </div>
        {subscribeError && <p className="text-red-600 text-sm mb-4">{subscribeError}</p>}

        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-sm text-gray-500 hover:text-primary underline inline-block mb-3"
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
