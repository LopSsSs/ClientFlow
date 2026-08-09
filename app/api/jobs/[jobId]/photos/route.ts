import { NextRequest, NextResponse } from 'next/server'
import { getJob } from '@/lib/neon'
import { getJobPhotos, createJobPhoto, getJobPhotoById, deleteJobPhoto } from '@/lib/db/jobPhotos'
import { getStorageService, StorageNotConfiguredError } from '@/services/storage'
import { requireBusiness, errorResponse, badRequest } from '@/lib/auth'

const MAX_SIZE_BYTES = 8 * 1024 * 1024

export async function GET(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { business } = await requireBusiness(req)
    const job = await getJob(params.jobId, business.id)
    if (!job) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 })
    }
    const photos = await getJobPhotos(params.jobId, business.id)
    return NextResponse.json({ data: photos })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { business } = await requireBusiness(req)
    const job = await getJob(params.jobId, business.id)
    if (!job) {
      return NextResponse.json({ error: 'Trabajo no encontrado' }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get('file')
    const type = formData.get('type')

    if (!(file instanceof Blob)) {
      return badRequest('Falta el archivo')
    }
    if (type !== 'before' && type !== 'after') {
      return badRequest('Tipo de foto no válido')
    }
    if (file.size > MAX_SIZE_BYTES) {
      return badRequest('La imagen supera el tamaño máximo de 8MB')
    }
    if (!file.type.startsWith('image/')) {
      return badRequest('Solo se admiten imágenes')
    }

    const extension = file.type.split('/')[1] || 'jpg'
    const path = `jobs/${params.jobId}/${type}-${Date.now()}.${extension}`

    const uploaded = await getStorageService().upload(path, file, file.type)
    const photo = await createJobPhoto(params.jobId, business.id, type, uploaded.url)

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    return errorResponse(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const { business } = await requireBusiness(req)
    const photoId = req.nextUrl.searchParams.get('id')
    if (!photoId) {
      return badRequest('Falta el id de la foto')
    }

    const photo = await getJobPhotoById(photoId, business.id)
    if (!photo || photo.job_id !== params.jobId) {
      return NextResponse.json({ error: 'Foto no encontrada' }, { status: 404 })
    }

    await deleteJobPhoto(photoId, business.id)
    try {
      await getStorageService().delete(photo.url)
    } catch (storageError) {
      if (!(storageError instanceof StorageNotConfiguredError)) throw storageError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
