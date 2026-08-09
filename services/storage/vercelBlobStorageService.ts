import { put, del } from '@vercel/blob'
import type { StorageService, UploadedFile } from './StorageService'

export class VercelBlobStorageService implements StorageService {
  constructor(private token: string) {}

  async upload(path: string, file: Blob, contentType: string): Promise<UploadedFile> {
    const blob = await put(path, file, {
      access: 'public',
      contentType,
      token: this.token,
      addRandomSuffix: true,
    })
    return { url: blob.url }
  }

  async delete(url: string): Promise<void> {
    await del(url, { token: this.token })
  }
}
