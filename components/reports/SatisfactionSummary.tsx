'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { getSurveySummary } from '@/lib/api'

interface SurveySummary {
  averageRating: number
  totalResponses: number
  recent: { client_name: string; rating: number; comment: string | null; submitted_at: string }[]
}

export default function SatisfactionSummary() {
  const [summary, setSummary] = useState<SurveySummary | null>(null)

  useEffect(() => {
    getSurveySummary().then(setSummary)
  }, [])

  if (!summary || summary.totalResponses === 0) return null

  return (
    <div className="card mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-primary">Satisfacción de clientes</h2>
        <div className="flex items-center gap-1">
          <Star size={18} className="fill-accent text-accent" />
          <span className="font-bold">{summary.averageRating.toFixed(1)}</span>
          <span className="text-sm text-gray-500">({summary.totalResponses} respuestas)</span>
        </div>
      </div>
      <div className="space-y-3">
        {summary.recent.map((r, i) => (
          <div key={i} className="border-b last:border-0 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{r.client_name}</span>
              <span className="flex">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} size={12} className="fill-accent text-accent" />
                ))}
              </span>
            </div>
            {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
