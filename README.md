# ClientFlow - CRM + Facturación para Servicios de Campo

Sistema completo de gestión de clientes, trabajos y facturación para jardineros, plomeros y otros servicios.

## 🚀 Setup Rápido (15 minutos)

### 1. Crear Proyecto Supabase (GRATIS)

1. Ve a https://supabase.com → Sign Up
2. Crea nuevo proyecto
3. Espera a que esté listo (2-3 min)
4. Ve a "SQL Editor"
5. Copia el contenido de `setup.sql`
6. Pégalo en SQL Editor y ejecuta
7. Ve a "Settings" → "API" y copia:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Crear Proyecto Vercel (GRATIS)

1. Ve a https://vercel.com → Sign Up
2. Conecta con GitHub
3. Import este repo
4. Variables de entorno:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```
5. Deploy automático

### 3. Setup Local (para desarrollo)

```bash
# Clonar
git clone https://github.com/TU_USER/ClientFlow.git
cd ClientFlow

# Instalar dependencias
npm install

# Crear .env.local
cp .env.local.example .env.local

# Editar .env.local con tus keys de Supabase

# Correr en desarrollo
npm run dev
```

Abre http://localhost:3000

### 4. Crear Stripe Account (GRATIS ahora, 2.9% cuando cobres)

1. https://stripe.com → Sign Up
2. Ve a Dashboard → Developers → API Keys
3. Copia las keys de TEST mode
4. Agrégalas a `.env.local`

### 5. Crear Resend Account (GRATIS, 100 emails/día)

1. https://resend.com → Sign Up
2. Ve a API Keys
3. Copia la key
4. Agrégala a `.env.local`

---

## 📂 Estructura del Proyecto

```
ClientFlow/
├── app/
│   ├── layout.jsx           # Layout principal
│   ├── page.jsx             # Landing / Dashboard
│   ├── auth/
│   │   ├── login/page.jsx   # Login
│   │   └── signup/page.jsx  # Signup
│   ├── dashboard/
│   │   ├── page.jsx         # Dashboard
│   │   ├── clients/page.jsx # Lista de clientes
│   │   ├── jobs/page.jsx    # Lista de trabajos
│   │   └── invoices/page.jsx # Lista de facturas
│   └── api/
│       ├── auth/route.js
│       ├── invoices/route.js
│       └── stripe/route.js
├── components/
│   ├── Navbar.jsx
│   ├── forms/ClientForm.jsx
│   ├── forms/JobForm.jsx
│   ├── forms/InvoiceForm.jsx
│   └── templates/InvoiceTemplate.jsx
├── lib/
│   ├── supabase.js          # Cliente Supabase
│   ├── stripe.js            # Configuración Stripe
│   └── invoiceGenerator.js  # Generar PDFs
├── context/
│   └── AuthContext.jsx      # Context de autenticación
├── setup.sql                 # Script Supabase
└── .env.local               # Variables locales
```

---

## 🔑 Features MVP

- ✅ Auth con Supabase (login/signup)
- ✅ CRUD Clientes
- ✅ CRUD Trabajos (crear, cambiar status)
- ✅ Generar facturas PDF
- ✅ Enviar facturas por email (Resend)
- ✅ Stripe checkout (cobrar pagos)
- ✅ Dashboard con métricas básicas

## 📋 Próximas fases (semana 3+)

- WhatsApp automático (n8n o Make)
- SMS recordatorios (Twilio)
- Reportes avanzados
- Geolocalización de trabajos

---

## 💡 Workflow típico

```
1. Jardinero crea cuenta
2. Crea su negocio (nombre, teléfono)
3. Agrega clientes
4. Crea trabajos (título, monto, fecha)
5. Marca trabajo como "completed"
6. Click "Generar factura"
7. Factura se crea automático + email al cliente
8. Cliente paga vía Stripe link
9. Dashboard actualiza (estado "paid")
```

---

## 🛠 Comandos útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm build

# Linter
npm run lint

# Supabase SQL (ejecutar en supabase.com)
# Copiar contenido setup.sql y pegar en SQL Editor
```

---

## 📞 Support

Si tienes issues:
1. Revisa que .env.local tenga las keys correctas
2. Verifica que Supabase esté ready
3. Revisa la consola del navegador (F12)

---

## 📝 Pricing (cuando tengas clientes)

- Starter: 19,99€/mes (50 clientes)
- Professional: 49,99€/mes (200 clientes)
- Enterprise: 99,99€/mes (ilimitado)

---

**Creado para ganar dinero desde día 1. Sin costos iniciales. 🚀**
