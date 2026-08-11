# Sistema de notificaciones en tiempo real

Toast en la esquina superior derecha (`components/NotificationCenter.tsx`,
store Zustand en `store/notificationStore.ts`, montado globalmente desde
`app/LayoutWrapper.tsx` dentro de `app/layout.jsx`).

## Uso

```tsx
'use client'
import { useNotification } from '@/store/notificationStore'

function MiComponente() {
  const { notifyEmail, notifyWhatsApp, notifySMS, notifySuccess, notifyError, notifyInfo } = useNotification()

  notifyEmail('cliente@email.com')       // 📧 azul
  notifyWhatsApp('+34600000000')         // 💬 verde
  notifySuccess('Operación completada')  // ✅ verde
  notifyError('Algo falló')              // ❌ rojo
}
```

**Regla importante:** solo llama a `notifyEmail`/`notifyWhatsApp` cuando el
backend confirme que el envío ocurrió de verdad (por ejemplo, un campo
`emailSent` en la respuesta de la API). No lances la notificación en paralelo
a la llamada "porque probablemente funcionó" — eso muestra una confirmación
falsa al usuario si el envío real falla.

## Integración actual

- **Alta de cuenta** (`app/auth/signup/page.jsx`): tras el registro,
  `app/api/auth/signup/route.js` intenta enviar el email de verificación y
  devuelve `emailSent: true/false` en la respuesta. El frontend solo muestra
  "📧 Email enviado" si `emailSent` es `true`; si falla, avisa con
  `notifyError` en vez de fingir que se envió.

## Pendiente (no implementado todavía)

Crear o marcar como pagada una factura **no envía email ni WhatsApp hoy**
(los recordatorios de factura/trabajo se disparan aparte, vía el cron
`app/api/cron/run-automations`, no al crear la factura). Para mostrar aquí un
aviso de "factura enviada por email/WhatsApp" primero hay que añadir ese
envío real en `app/api/invoices/route.js` (o donde corresponda) y que la
respuesta indique qué canales tuvieron éxito, igual que se hizo en signup.
