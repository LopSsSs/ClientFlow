/**
 * Store de notificaciones en tiempo real con Zustand
 * Muestra cuando se envía email, SMS, WhatsApp, etc.
 */

import { create } from 'zustand'

export interface Notification {
  id: string
  type: 'email' | 'whatsapp' | 'sms' | 'success' | 'error' | 'info'
  message: string
  details?: {
    recipient?: string
    timestamp?: string
    invoiceNumber?: string
  }
  duration?: number // ms (5000 = 5 segundos)
  createdAt: number
}

interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = `${Date.now()}-${Math.random()}`
    const fullNotification: Notification = {
      ...notification,
      id,
      createdAt: Date.now(),
      duration: notification.duration || 5000,
    }

    set((state) => ({
      notifications: [fullNotification, ...state.notifications].slice(0, 5), // Max 5
    }))

    // Auto-remover después de duration
    if (fullNotification.duration) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, fullNotification.duration)
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  clearAll: () => {
    set({ notifications: [] })
  },
}))

/**
 * Hook para agregar notificación fácilmente
 */
export function useNotification() {
  const addNotification = useNotificationStore((state) => state.addNotification)

  return {
    notifyEmail: (recipient: string, invoiceNumber?: string) => {
      addNotification({
        type: 'email',
        message: `📧 Email enviado`,
        details: {
          recipient,
          timestamp: new Date().toLocaleTimeString('es-ES'),
          invoiceNumber,
        },
        duration: 6000,
      })
    },

    notifyWhatsApp: (recipient: string, invoiceNumber?: string) => {
      addNotification({
        type: 'whatsapp',
        message: `💬 WhatsApp enviado`,
        details: {
          recipient,
          timestamp: new Date().toLocaleTimeString('es-ES'),
          invoiceNumber,
        },
        duration: 6000,
      })
    },

    notifySMS: (recipient: string) => {
      addNotification({
        type: 'sms',
        message: `📱 SMS enviado`,
        details: {
          recipient,
          timestamp: new Date().toLocaleTimeString('es-ES'),
        },
        duration: 6000,
      })
    },

    notifySuccess: (message: string) => {
      addNotification({
        type: 'success',
        message: `✅ ${message}`,
        duration: 4000,
      })
    },

    notifyError: (message: string) => {
      addNotification({
        type: 'error',
        message: `❌ ${message}`,
        duration: 7000,
      })
    },

    notifyInfo: (message: string) => {
      addNotification({
        type: 'info',
        message: `ℹ️ ${message}`,
        duration: 5000,
      })
    },
  }
}