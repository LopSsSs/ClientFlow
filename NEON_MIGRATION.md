# 🔄 ClientFlow - Migración a Neon (PostgreSQL)

## ¿Qué cambió?

Pasamos de **Supabase** (que maneja autenticación + BD) a **Neon** (solo BD PostgreSQL).

Esto significa:
- ✅ Mismas funcionalidades
- ✅ Incluso más rápido
- ✅ 100% gratis
- ⚠️ Pequeños cambios en el código (ya hechos)

---

## 📋 Pasos para Terminar el Setup

### PASO 1: Ejecutar SQL en Neon (10 minutos)

1. Ve a: https://console.neon.tech
2. Inicia sesión
3. Haz clic en tu proyecto **"ClientFlow"**
4. Click en pestaña **"SQL Editor"** (izquierda)
5. Click en **"New Query"**
6. Abre el archivo `setup.sql` desde tu PC
7. **Copia TODO el contenido**
8. Pégalo en el editor Neon
9. Click en **"Execute"** (botón verde)
10. Espera a que termine ✅

**Verás un mensaje verde diciendo que todo fue ejecutado.**

---

### PASO 2: Actualizar tu `.env.local` (2 minutos)

En tu carpeta `ClientFlow/`:

1. Abre `.env.local` (si no existe, cópialopueblo desde `.env.local.example`)
2. Reemplaza el contenido con:

```
# Tu connection string de Neon
DATABASE_URL=postgresql://neondb_owner:TUPASSWORD@ep-bold-waterfall-ax4rdnv4-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secret (genera uno: openssl rand -base64 32)
JWT_SECRET=tu-jwt-secret-aqui

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Para JWT_SECRET**, ejecuta en terminal:
```bash
openssl rand -base64 32
```
Copia el resultado y pégalo en `JWT_SECRET=`

### PASO 3: Instalar dependencias (5 minutos)

En tu terminal, en la carpeta `ClientFlow`:

```bash
npm install
# O si tienes problemas:
npm install --legacy-peer-deps
```

Esto instalará:
- `postgres` (cliente PostgreSQL)
- `bcryptjs` (encriptar contraseñas)
- `jsonwebtoken` (JWT)

### PASO 4: Corre localmente (2 minutos)

```bash
npm run dev
```

Abre: http://localhost:3000

**Si ves la landing page, ¡funciona!**

---

## ✅ Verificar que TODO funciona

1. Ve a http://localhost:3000
2. Click en **"Comenzar Ahora"**
3. Crea una cuenta:
   - Email: `tuname@gmail.com`
   - Contraseña: `12345678`
   - Negocio: `Mi Jardinería`
4. Click **"Crear Cuenta"**
5. **Si ves el Dashboard → ✅ FUNCIONA TODO**

---

## 🆘 Si algo falla

### Error: "Cannot find module 'postgres'"
```bash
npm install postgres bcryptjs jsonwebtoken
```

### Error: "JWT_SECRET is not defined"
- Verifica que `.env.local` está en la raíz de `ClientFlow/`
- Verifica que tiene `JWT_SECRET=algo`
- Reinicia: `npm run dev`

### Error: "Connection refused"
- Verifica que tu `DATABASE_URL` en `.env.local` es correcta
- Verificá que NO tiene espacios al inicio/final
- En Neon, copia de nuevo la connection string

### Error: "password authentication failed"
- La contraseña en `DATABASE_URL` está mal
- Ve a Neon → Settings → Security → Reset password
- Copia de nuevo la connection string completa

### Error: "database "neondb" does not exist"
- Ejecuta el `setup.sql` en Neon SQL Editor (PASO 1)
- Verifica que dice "Query executed successfully"

---

## 🚀 Próximos Pasos

### Ya funciona localmente:

1. **Crea 5 clientes de prueba**
2. **Crea 5 trabajos**
3. **Crea 2-3 facturas y descarga PDF**

Si TODO funciona → estás listo para:

### Deploy en Vercel:

1. Push a GitHub:
```bash
git add .
git commit -m "Migrate to Neon"
git push origin main
```

2. Ve a https://vercel.com/dashboard
3. Click "New Project"
4. Selecciona tu repo `ClientFlow`
5. **Environment Variables:**
   - `DATABASE_URL` = Tu connection string Neon
   - `JWT_SECRET` = Tu JWT secret
6. Click "Deploy"
7. Espera 3 minutos
8. ¡Listo! Tu app está online

---

## 📊 Comparación Supabase vs Neon

| Feature | Supabase | Neon |
|---------|----------|------|
| PostgreSQL | ✅ | ✅ |
| Auth integrado | ✅ | ❌ (hacemos manual) |
| Storage | ✅ | ❌ (no necesitamos aún) |
| Gratis | ✅ | ✅ |
| Proyectos ilimitados | ❌ (1 free) | ✅ |
| Velocidad | Buena | Excelente |

---

## 🎯 Resumen

**Antes (Supabase):**
- 1 proyecto free
- Auth + BD integrados
- Más fácil

**Ahora (Neon):**
- Proyectos ilimitados
- Solo BD (auth manual)
- Más control, misma funcionalidad

**Resultado:** Mismo app, mejor infraestructura, 0 costo. ✅

---

## ❓ Preguntas Frecuentes

**¿Pierdo mis datos de Supabase?**
No. Si quieres migrar datos antiguos, te muestro cómo exportar.

**¿Qué pasa con Mediterraneum PWA?**
Sigue usando su Supabase. ClientFlow tiene su propio proyecto Neon.

**¿Puedo volver a Supabase?**
Sí, pero no lo hagas. Neon es mejor para este caso.

**¿Hay costos ocultos?**
No. Neon free es realmente gratis. Stripe se cobra solo cuando cobres.

---

**¿Listo? Sigue los 4 PASOS y me dices cuando termines.** ⬆️
