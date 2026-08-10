'use client'

import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/hooks/useTranslation'

// react-big-calendar toca el DOM al montar; se carga solo en cliente.
const JobsCalendar = dynamic(() => import('@/components/calendar/JobsCalendar'), { ssr: false })

export default function CalendarPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-primary mb-8">{t('calendar.title')}</h1>
        <JobsCalendar />
      </div>
    </div>
  )
}
