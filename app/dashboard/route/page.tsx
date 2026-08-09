'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import { getTodaysRoute } from '@/lib/api'
import { MapPin, ExternalLink } from 'lucide-react'

const RouteMap = dynamic(() => import('@/components/route/RouteMap'), { ssr: false })

interface RouteJob {
  id: string
  title: string
  scheduled_date: string
  status: string
  client_name: string
  client_address: string | null
  client_city: string | null
  client_latitude: number | null
  client_longitude: number | null
}

function buildGoogleMapsUrl(jobs: RouteJob[]): string | null {
  const withAddress = jobs.filter((j) => j.client_address)
  if (withAddress.length === 0) return null

  const points = withAddress.map((j) => `${j.client_address}, ${j.client_city || ''}`)
  const destination = points[points.length - 1]!
  const waypoints = points.slice(0, -1)

  const url = new URL('https://www.google.com/maps/dir/')
  url.searchParams.set('api', '1')
  url.searchParams.set('destination', destination)
  if (waypoints.length > 0) {
    url.searchParams.set('waypoints', waypoints.join('|'))
  }
  url.searchParams.set('travelmode', 'driving')
  return url.toString()
}

export default function RoutePage() {
  const [jobs, setJobs] = useState<RouteJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTodaysRoute()
      .then(({ data }: { data: RouteJob[] }) => setJobs(data || []))
      .finally(() => setLoading(false))
  }, [])

  const stops = jobs
    .filter((j) => j.client_latitude !== null && j.client_longitude !== null)
    .map((j) => ({
      id: j.id,
      title: j.title,
      clientName: j.client_name,
      latitude: j.client_latitude!,
      longitude: j.client_longitude!,
    }))

  const mapsUrl = buildGoogleMapsUrl(jobs)

  return (
    <div className="min-h-screen bg-light">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-4xl font-bold text-primary">Ruta de hoy</h1>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-accent flex items-center gap-2">
              <ExternalLink size={18} /> Abrir ruta en Google Maps
            </a>
          )}
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : jobs.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">No hay trabajos programados para hoy.</div>
        ) : (
          <>
            <div className="card mb-6 overflow-hidden p-0">
              <RouteMap stops={stops} />
            </div>

            <div className="card">
              <div className="space-y-3">
                {jobs.map((job, index) => (
                  <div key={job.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                    <span className="bg-primary text-light rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin size={14} /> {job.client_name}
                        {job.client_address ? ` — ${job.client_address}` : ''}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(job.scheduled_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
