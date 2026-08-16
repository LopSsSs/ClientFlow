'use client'

import { useEffect, useState } from 'react'
import { getInvoiceSettings } from '@/lib/api'
import type { BusinessSettings } from '@/lib/db/businessSettings'

export function useInvoiceSettings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInvoiceSettings()
      .then((data: BusinessSettings) => setSettings(data))
      .catch((err: Error) => console.error('Error cargando configuración de facturas:', err))
      .finally(() => setLoading(false))
  }, [])

  return { settings, loading }
}
