import { NextRequest, NextResponse } from 'next/server'
import { requireBusiness, errorResponse, badRequest } from '@/lib/auth'
import { getStorageService, StorageNotConfiguredError } from '@/services/storage'

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    const { business } = await requireBusiness(req)

    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof Blob)) {
      return badRequest('Falta el archivo')
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return badRequest('Solo se admiten imágenes JPG, PNG o WEBP')
    }
    if (file.size > MAX_SIZE_BYTES) {
      return badRequest('La imagen supera el tamaño máximo de 5MB')
    }

    const extension = file.type.split('/')[1] || 'png'
    const path = `invoices/logos/${business.id}/logo.${extension}`

    const uploaded = await getStorageService().upload(path, file, file.type)

    return NextResponse.json({ url: uploaded.url })
  } catch (error) {
    if (error instanceof StorageNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }
    return errorResponse(error)
  }
}
