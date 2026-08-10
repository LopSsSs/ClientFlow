'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, type Event } from 'react-big-calendar'
import withDragAndDrop, { type EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es, enUS, fr, de } from 'date-fns/locale'
import { getJobs, updateJob } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'
import type { Locale } from '@/types/i18n'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

const DATE_FNS_LOCALES = { es, en: enUS, fr, de }

function buildLocalizer(locale: Locale) {
  return dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: DATE_FNS_LOCALES[locale] }),
    getDay,
    locales: DATE_FNS_LOCALES,
  })
}

interface JobEvent extends Event {
  id: string
  job: Record<string, unknown>
}

const DnDCalendar = withDragAndDrop<JobEvent>(Calendar)

function toEvent(job: Record<string, unknown>): JobEvent | null {
  if (!job.scheduled_date) return null
  const start = new Date(job.scheduled_date as string)
  const hours = typeof job.duration_hours === 'number' && job.duration_hours > 0 ? job.duration_hours : 1
  const end = new Date(start.getTime() + hours * 60 * 60 * 1000)
  const clientName = (job as { clients?: { name?: string } }).clients?.name
  return {
    id: job.id as string,
    title: clientName ? `${job.title} — ${clientName}` : (job.title as string),
    start,
    end,
    job,
  }
}

export default function JobsCalendar() {
  const { t, locale } = useTranslation()
  const localizer = useMemo(() => buildLocalizer(locale), [locale])
  const [jobs, setJobs] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await getJobs()
    setJobs(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const events = useMemo(
    () => jobs.map(toEvent).filter((e): e is JobEvent => e !== null),
    [jobs]
  )

  const handleEventDrop = useCallback(
    async ({ event, start }: EventInteractionArgs<JobEvent>) => {
      await updateJob(event.id, { ...event.job, scheduled_date: new Date(start).toISOString() })
      load()
    },
    [load]
  )

  if (loading) return null

  return (
    <div style={{ height: 700 }} className="card">
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onEventDrop={handleEventDrop}
        draggableAccessor={() => true}
        culture={locale}
        messages={{
          today: t('calendar.today'),
          previous: t('calendar.previous'),
          next: t('calendar.next'),
          month: t('calendar.month'),
          week: t('calendar.week'),
          day: t('calendar.day'),
          agenda: t('calendar.agenda'),
          noEventsInRange: t('calendar.noEvents'),
        }}
      />
    </div>
  )
}
