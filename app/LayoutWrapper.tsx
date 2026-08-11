/**
 * Client-side layout wrapper que proporciona contexto y notificaciones
 */

'use client'

import { NotificationCenter } from '@/components/NotificationCenter'
import { ReactNode } from 'react'

export function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <NotificationCenter />
    </>
  )
}