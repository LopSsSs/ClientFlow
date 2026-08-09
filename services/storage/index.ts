import type { StorageService } from './StorageService'
import { VercelBlobStorageService } from './vercelBlobStorageService'

export class StorageNotConfiguredError extends Error {
  constructor() {
    super('El almacenamiento de archivos no está configurado (falta BLOB_READ_WRITE_TOKEN)')
  }
}

export function isStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

// A diferencia de email/mensajería, subir un archivo no tiene un "fallback"
// razonable sin backend real: si no hay token, se informa con un error claro
// en vez de fingir que la subida funcionó.
export function getStorageService(): StorageService {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    throw new StorageNotConfiguredError()
  }
  return new VercelBlobStorageService(token)
}

export type { StorageService, UploadedFile } from './StorageService'
