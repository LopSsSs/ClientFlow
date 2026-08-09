export interface UploadedFile {
  url: string
}

export interface StorageService {
  upload(path: string, file: Blob, contentType: string): Promise<UploadedFile>
  delete(url: string): Promise<void>
}
