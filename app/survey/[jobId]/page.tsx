'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Star, CheckCircle2, XCircle } from 'lucide-react'

interface PublicSurvey {
  job_id: string
  job_title: string
  company_name: string
  client_name: string
  already_submitted: boolean
}

export default function SurveyPage() {
  const params = useParams<{ jobId: string }>()
  const [survey, setSurvey] = useState<PublicSurvey | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/survey/${params.jobId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Encuesta no encontrada')
        return res.json() as Promise<PublicSurvey>
      })
      .then(setSurvey)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false))
  }, [params.jobId])

  const handleSubmit = async () => {
    if (rating === 0) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch(`/api/survey/${params.jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar')
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-light flex items-center justify-center">Cargando...</div>
  }

  if (loadError || !survey) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center p-6">
        <div className="card max-w-md text-center">
          <XCircle className="mx-auto mb-4 text-red-500" size={40} />
          <p className="text-gray-700">{loadError || 'Encuesta no encontrada'}</p>
        </div>
      </div>
    )
  }

  const alreadyDone = survey.already_submitted || submitted

  return (
    <div className="min-h-screen bg-light flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center">
        <p className="text-sm text-gray-500 mb-1">{survey.company_name}</p>
        <h1 className="text-2xl font-bold text-primary mb-2">¿Qué tal fue {survey.job_title}?</h1>
        <p className="text-sm text-gray-600 mb-6">Hola {survey.client_name}, tu opinión nos ayuda a mejorar.</p>

        {alreadyDone ? (
          <div className="flex flex-col items-center gap-2 text-green-700 py-6">
            <CheckCircle2 size={40} />
            <p className="font-medium">¡Gracias por tu valoración!</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`${value} estrellas`}
                >
                  <Star
                    size={32}
                    className={value <= rating ? 'fill-accent text-accent' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>

            <textarea
              placeholder="Cuéntanos más (opcional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field h-24 mb-4"
            />

            <button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="btn-accent w-full"
            >
              {submitting ? 'Enviando...' : 'Enviar valoración'}
            </button>
            {submitError && <p className="text-red-600 text-sm mt-3">{submitError}</p>}
          </>
        )}
      </div>
    </div>
  )
}
