import { NextRequest, NextResponse } from 'next/server'
import { getPublicSurvey, submitSurvey } from '@/lib/db/surveys'

export async function GET(_req: NextRequest, { params }: { params: { jobId: string } }) {
  const survey = await getPublicSurvey(params.jobId)
  if (!survey) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    job_id: survey.job_id,
    job_title: survey.job_title,
    company_name: survey.company_name,
    client_name: survey.client_name,
    already_submitted: survey.submitted_at !== null,
  })
}

export async function POST(req: NextRequest, { params }: { params: { jobId: string } }) {
  const body = await req.json()
  const rating = Number(body.rating)

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'La valoración debe ser de 1 a 5' }, { status: 400 })
  }

  const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 1000) : null
  const updated = await submitSurvey(params.jobId, rating, comment || null)

  if (!updated) {
    return NextResponse.json({ error: 'Encuesta no disponible o ya enviada' }, { status: 409 })
  }

  return NextResponse.json({ success: true })
}
