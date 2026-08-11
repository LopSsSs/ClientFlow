/**
 * Componente que muestra notificaciones en tiempo real
 * Aparece en la esquina superior derecha
 */

'use client'

import { useNotificationStore } from '@/store/notificationStore'
import { X } from 'lucide-react'

export function NotificationCenter() {
  const { notifications, removeNotification } = useNotificationStore()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm
            transition-all duration-300 ease-out
            ${
              notification.type === 'email'
                ? 'bg-blue-50 border-blue-500 text-blue-900'
                : notification.type === 'whatsapp'
                  ? 'bg-green-50 border-green-500 text-green-900'
                  : notification.type === 'sms'
                    ? 'bg-purple-50 border-purple-500 text-purple-900'
                    : notification.type === 'success'
                      ? 'bg-green-50 border-green-500 text-green-900'
                      : notification.type === 'error'
                        ? 'bg-red-50 border-red-500 text-red-900'
                        : 'bg-gray-50 border-gray-500 text-gray-900'
            }
          `}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-semibold">{notification.message}</p>

              {notification.details && (
                <div className="text-sm opacity-75 mt-1 space-y-1">
                  {notification.details.recipient && (
                    <p>
                      📌 <span className="font-mono">{notification.details.recipient}</span>
                    </p>
                  )}
                  {notification.details.invoiceNumber && (
                    <p>Factura: #{notification.details.invoiceNumber}</p>
                  )}
                  {notification.details.timestamp && (
                    <p>⏰ {notification.details.timestamp}</p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 flex-shrink-0 hover:opacity-70 transition-opacity"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}