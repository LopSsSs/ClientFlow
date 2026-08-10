'use client'

import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/hooks/useTranslation'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export default function TrialBanner() {
  const { subscription } = useAuth()
  const { t } = useTranslation()

  if (!subscription || subscription.status !== 'trialing' || !subscription.current_period_end) {
    return null
  }

  const daysLeft = Math.ceil(
    (new Date(subscription.current_period_end).getTime() - Date.now()) / MS_PER_DAY
  )

  const message =
    daysLeft > 1
      ? t('trial.banner', { days: String(daysLeft) })
      : daysLeft === 1
        ? t('trial.bannerLastDay')
        : t('trial.expired')

  return (
    <div className="bg-accent/20 text-primary text-sm text-center py-2 px-4">
      {message}
    </div>
  )
}
