# ClientFlow - Guía de Setup Completa

## ⚡ Setup en 4 Pasos (30 minutos máximo)

### PASO 1: Crear Proyecto Supabase (Gratis)

1. **Ve a:** https://supabase.com
2. **Haz clic:** "Sign Up" → Usa tu cuenta de Google o correo
3. **Crea un nuevo proyecto:**
   - Nombre: `ClientFlow`
   - Contraseña: Algo fuerte (la guarda automático)
   - Region: Elige la más cercana a ti (Europe - Irlanda está bien)
4. **Espera 2-3 minutos** mientras se inicializa
5. **Cuando esté listo, abre la consola SQL:**
   - Click en "SQL Editor" (lado izquierdo)
   - Click en "New Query"
   - Copia TODO el contenido de `setup.sql` (en este repo)
   - Pégalo en el editor
   - **Ejecuta** (botón "▶" o Cmd+Enter)
   - Espera a que termine ✅

6. **Obtén tus API Keys:**
   - Click en "Settings" (arriba a la izquierda)
   - Click en "API"
   - Copia estas dos cosas:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Guarda en un archivo temporal

---

### PASO 2: Crear Cuenta Vercel (Gratis)

1. **Ve a:** https://vercel.com
2. **Sign Up** → "Continue with GitHub" (o crea cuenta)
3. Si no tienes GitHub:
   - Ve a https://github.com → Sign Up
   - Vuelve a Vercel e intenta de nuevo
4. **Conecta tu GitHub** en Vercel
5. **No subas nada aún** — espera los próximos pasos

---

### PASO 3: Setup Local (Tu PC)

#### Opción A: Con Git (recomendado)

```bash
# 1. Clona este repo
git clone https://github.com/TU_USER/ClientFlow.git
cd ClientFlow

# 2. Instala dependencias
npm install
# Si no funciona: 
# npm install --legacy-peer-deps

# 3. Crear archivo .env.local
cp .env.local.example .env.local

# 4. Editar .env.local con tus keys
# Abre .env.local en tu editor y pega:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...xxx

# 5. Corre en desarrollo
npm run dev

# Abre http://localhost:3000
```

#### Opción B: Manual (si no tienes Git)

1. Descarga todo este proyecto como ZIP
2. Descomprime en tu carpeta
3. Abre terminal en esa carpeta
4. Sigue los comandos de "Opción A" a partir del paso 2

---

### PASO 4: Deploy en Vercel (Gratis)

#### Si NO tienes GitHub:

```bash
# Inicializa Git en tu carpeta
git init
git add .
git commit -m "Initial commit"

# Crea repo en GitHub
# Ve a https://github.com/new
# Nombre: ClientFlow
# Description: "CRM para servicios"
# Public o Private
# Copia el comando que te da:

git remote add origin https://github.com/TU_USER/ClientFlow.git
git branch -M main
git push -u origin main

# Verifica que se subió: https://github.com/TU_USER/ClientFlow
```

#### Deploy:

1. **Ve a:** https://vercel.com/dashboard
2. **Click:** "Add New..." → "Project"
3. **Selecciona:** Tu repo `ClientFlow`
4. **Environment Variables:**
   - Pega tus 2 keys de Supabase:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
     ```
5. **Click:** "Deploy"
6. **Espera 3 minutos** ⏳
7. **¡Listo!** Tu app estará en `https://tuproyecto.vercel.app`

---

## ✅ Verificar que TODO funciona

### Local (http://localhost:3000):

1. **Ve a** http://localhost:3000
2. **Haz clic en** "Comenzar Ahora"
3. **Crea una cuenta:**
   - Email: `tuname@gmail.com`
   - Contraseña: `12345678` (mínimo)
   - Nombre del negocio: `Mi Jardinería`
4. **Click en** "Crear Cuenta"
5. **Si ves el Dashboard** ✅ Todo está funcionando

### Online (en Vercel):

1. Repite los pasos arriba en tu URL de Vercel
2. Comprueba que puedes crear clientes y trabajos

---

## 🚀 Primeros Pasos en la App

### 1. Configura tu Negocio
- Dashboard → Información del Negocio
- Agrega teléfono y WhatsApp

### 2. Agrega tu Primer Cliente
- Click en "Agregar Cliente"
- Nombre, teléfono, email
- Tipo de servicio: "Jardinería"
- Save

### 3. Crea tu Primer Trabajo
- Vete a "Trabajos"
- Click "Crear Trabajo"
- Selecciona el cliente
- Título: "Poda de plantas"
- Monto: 50€
- Click "Crear"

### 4. Genera tu Primera Factura
- Vete a "Facturas"
- Click "Crear Factura"
- Selecciona el trabajo (o monto manual)
- Click "Crear Factura"
- Click en el icono de Descargar para PDF

---

## 🆘 Troubleshooting

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install
# o
npm install --legacy-peer-deps
```

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Verifica que tu `.env.local` está en la carpeta raíz
- Reinicia `npm run dev`
- En Vercel: verifica que agregaste las 2 variables

### Error: "Conexión a Supabase rechazada"
- Verifica que la URL de Supabase es correcta (sin typos)
- Supabase URL debe empezar con `https://`
- Si cambiaste de proyecto: actualiza `.env.local`

### "La app se ve rota/sin estilos"
- Limpia cache: Ctrl+Shift+Del (en navegador)
- Reinicia: npm run dev
- Espera a que compile (puede tardar 10s)

### "No aparecen mis clientes"
- Verifica que creaste la cuenta correctamente
- Mira la consola (F12) para errores
- En Supabase SQL: Ejecuta `SELECT * FROM clients;` para ver si están

---

## 📋 Checklist Final

- [ ] Supabase proyecto creado
- [ ] SQL ejecutado en Supabase
- [ ] `.env.local` con keys de Supabase
- [ ] `npm install` funcionó
- [ ] `npm run dev` corre sin errores
- [ ] Puedes login/signup
- [ ] Puedes crear clientes
- [ ] Puedes crear trabajos
- [ ] Puedes generar facturas PDF
- [ ] Deploy en Vercel funciona

---

## 🎯 Próximos Pasos (Opcional, después de confirmar que todo funciona)

1. **Invita tus primeros 5 clientes** (Gratis 14 días)
2. **Configura Stripe** para empezar a cobrar
3. **Agrega WhatsApp automático** (Make.com o n8n)
4. **Sube precio a 19,99€/mes**

---

## 📞 Support

Si algo no funciona:
1. Revisa este SETUP.md
2. Mira los errores en la consola (F12)
3. Revisa Supabase dashboard (¿existen tus tablas?)
4. Pregunta en: discord.gg/clientflow (cuando exista)

---

**¡Listo para empezar!** 🚀
