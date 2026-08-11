'use client'

import { useAuth } from '@/context/AuthContext'
import { usePlanCheckout } from '@/hooks/usePlanCheckout'
import { useTranslation } from '@/hooks/useTranslation'
import { PLANS } from '@/lib/plans'
import { CheckCircle } from 'lucide-react'

export default function PlanPage() {
  const { subscription } = useAuth()
  const { t } = useTranslation()
  const { choosingPlan, error, choosePlan } = usePlanCheckout()

  const currentPlanId = subscription?.status === 'active' ? subscription.plan : null

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-primary mb-1">{t('plan.title')}</h1>
      <p className="text-gray-600 mb-8">
        {currentPlanId
          ? t('plan.currentPlanSubtitle', { plan: PLANS[currentPlanId]?.name || currentPlanId })
          : t('plan.trialSubtitle')}
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {Object.values(PLANS).map((plan) => {
          const isCurrent = plan.id === currentPlanId
          return (
            <div
              key={plan.id}
              className={`rounded-lg p-6 border-2 ${
                isCurrent ? 'border-accent bg-accent/10' : plan.highlight ? 'border-primary' : 'border-gray-200'
              }`}
            >
              <h3 className="text-xl font-bold text-primary mb-1">{plan.name}</h3>
              <p className="text-3xl font-bold text-accent mb-1">{plan.priceLabel}</p>
              <p className="text-sm text-gray-500 mb-4">{t('plan.perMonth')}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-accent flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => choosePlan(plan.id)}
                disabled={isCurrent || choosingPlan !== null}
                className="btn-accent w-full py-2 disabled:opacity-50"
              >
                {isCurrent
                  ? t('plan.currentPlanBadge')
                  : choosingPlan === plan.id
                    ? t('plan.redirecting')
                    : t('plan.choosePlan')}
              </button>
            </div>
          )
        })}
      </div>

      {error && <p className="text-red-600 text-sm mt-6">{error}</p>}
    </div>
  )
}
