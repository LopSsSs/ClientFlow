'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { getJobPhotos, uploadJobPhoto, deleteJobPhoto } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'
import { Trash2, Upload } from 'lucide-react'
import type { JobPhoto, JobPhotoType } from '@/types/jobPhoto'

interface JobPhotosGalleryProps {
  jobId: string
}

export default function JobPhotosGallery({ jobId }: JobPhotosGalleryProps) {
  const { t } = useTranslation()
  const COLUMNS: { type: JobPhotoType; label: string }[] = [
    { type: 'before', label: t('jobPhotos.before') },
    { type: 'after', label: t('jobPhotos.after') },
  ]
  const [photos, setPhotos] = useState<JobPhoto[]>([])
  const [uploading, setUploading] = useState<JobPhotoType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    const { data } = await getJobPhotos(jobId)
    setPhotos(data || [])
  }

  useEffect(() => {
    load()
  }, [jobId])

  const handleUpload = async (type: JobPhotoType, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploading(type)
    setError(null)
    try {
      await uploadJobPhoto(jobId, file, type)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('jobPhotos.uploadError'))
    } finally {
      setUploading(null)
    }
  }

  const handleDelete = async (photoId: string) => {
    await deleteJobPhoto(jobId, photoId)
    load()
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{t('jobPhotos.label')}</label>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        {COLUMNS.map(({ type, label }) => (
          <div key={type}>
            <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {photos
                .filter((p) => p.type === type)
                .map((photo) => (
                  <div key={photo.id} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt={label} className="w-full h-16 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => handleDelete(photo.id)}
                      className="absolute top-0.5 right-0.5 bg-white/90 rounded-full p-0.5 text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
            </div>
            <label className="btn-secondary text-xs flex items-center justify-center gap-1 cursor-pointer py-1.5">
              <Upload size={14} />
              {uploading === type ? t('jobPhotos.uploading') : t('jobPhotos.addPhoto')}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading !== null}
                onChange={(e) => handleUpload(type, e)}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
