# Plan de implementación — Personalización de facturas (business_settings)

Adaptación del roadmap `TAREAS-PARA-CLAUDE-CODE.md` a la estructura real del
proyecto. El documento original asume `pg.Pool`, `verifyAuth`, TypeScript
puro y Jest; el proyecto real usa otra cosa en cada uno de esos puntos, así
que el plan de abajo es el que se ejecuta de verdad.

## Desviaciones respecto al documento original

- **DB**: no hay `pool`/`pg`. Se usa `sql` (postgres.js) desde `lib/neon.js`,
  con funciones en `lib/db/*.ts`. `lib/db/businessSettings.ts` sigue ese
  patrón.
- **Auth**: no existe `verifyAuth`. El patrón real es
  `requireBusiness(req)` + `errorResponse(error)` / `badRequest(msg)` de
  `lib/auth.js`, que ya resuelve negocio del usuario y expiración de trial.
- **Migración**: se numera `008_business_settings.sql` (convención existente,
  no timestamp) y usa `uuid_generate_v4()` (no `gen_random_uuid()`, para
  coincidir con el resto del esquema). Sin trigger `updated_at`: el proyecto
  no usa triggers en ningún sitio, `updated_at` se fija con `NOW()` en cada
  UPDATE, igual que `updateBusiness`. Además `scripts/apply-migrations.mjs`
  divide el fichero por `;` de forma ingenua, así que una función
  `CREATE FUNCTION ... $$ ... ; ... $$` con triggers se rompería igualmente.
- **PDF existente**: ya hay un `lib/invoiceGenerator.js` en producción (verde
  oscuro/dorado, usado por la página de facturas y por el envío de email).
  Se **extiende**, no se reemplaza por el diseño "angular naranja" del
  documento — cambiar el diseño de facturas ya enviadas a clientes reales es
  una decisión de producto, no algo a decidir unilateralmente. Los nuevos
  campos (logo, colores, métodos de pago, país/impuesto, términos) se añaden
  como parámetros opcionales con fallback al comportamiento actual.
- **Logo en el PDF**: `jsPDF.addImage` no acepta una URL remota directamente
  (ni en servidor ni en navegador) — hay que descargarla y convertirla a
  data URI antes. Se añade un helper `urlToDataUri()` con captura de errores
  (si falla la descarga o el formato no es compatible, el PDF se genera sin
  logo en vez de romperse).
- **Storage**: ya existe `services/storage` (envuelve `@vercel/blob` con
  `getStorageService().upload()`), usado por la subida de fotos de trabajos.
  El endpoint de logo lo reutiliza en vez de llamar a `put()` directamente.
- **Frontend**: se seguyen las convenciones existentes — `Navbar`,
  clases `card`/`input-field`/`btn-accent`/`btn-secondary`, `useTranslation`
  + claves nuevas en `locales/es.json` y `locales/en.json`, `useAuth()`,
  wrappers en `lib/api.js` (no `fetch` suelto en el componente),
  `useNotification()` de `store/notificationStore.ts` (no un store nuevo).
- **Tests**: el proyecto no tiene ningún framework de test instalado (sin
  Jest/Vitest, sin script `test` en `package.json`). Instalar uno es una
  decisión de tooling que no se toma en silencio dentro de esta tarea:
  la verificación de `generateInvoicePDF` se hace con un script Node
  puntual durante la Fase 6 (se borra al terminar), no con un `__tests__/`
  permanente. Se avisa al usuario al final por si quiere Vitest instalado.
- **`.env.example`**: no existía. Se crea con las variables que el código
  realmente usa (`grep process.env` sobre el repo), no con la lista genérica
  del documento — que incluía cosas ya cubiertas (`BLOB_READ_WRITE_TOKEN` ya
  es necesaria hoy para las fotos de trabajos) y omitía otras reales
  (`TWILIO_*`, `MAKE_WEBHOOK_SECRET`, `CRON_SECRET`).

## Archivos que se crean o tocan

1. `migrations/008_business_settings.sql` (nuevo)
2. `lib/constants/taxByCountry.ts` (nuevo)
3. `lib/db/businessSettings.ts` (nuevo)
4. `app/api/settings/invoices/route.ts` (nuevo, GET+PUT)
5. `app/api/settings/invoices/logo/route.ts` (nuevo, POST)
6. `lib/invoiceGenerator.js` (extendido, no reescrito)
7. `services/invoices/sendInvoiceEmail.service.ts` (pasa business_settings real)
8. `app/dashboard/invoices/page.jsx` (usa business_settings al descargar)
9. `hooks/useInvoiceSettings.ts` (nuevo)
10. `app/dashboard/settings/invoices/page.tsx` (nuevo)
11. `app/dashboard/settings/page.tsx` (enlace a la nueva página)
12. `lib/api.js` (3 funciones nuevas)
13. `locales/es.json` + `locales/en.json` (claves `invoiceSettings.*`)
14. `.env.example` (nuevo)

No se toca `app/api/invoices/generate-pdf/route.ts` del documento original:
el PDF ya se genera donde hace falta (cliente al descargar, servidor al
enviar email); un tercer endpoint duplicaría lógica sin un consumidor real.
