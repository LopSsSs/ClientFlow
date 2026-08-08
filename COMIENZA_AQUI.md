# 🚀 ClientFlow - COMIENZA AQUI

## ¿Qué es esto?

**ClientFlow** es un CRM + Facturación 100% personalizado para jardineros, plomeros y otros servicios de campo.

**Características completamente funcionales:**
- ✅ Gestión de clientes (crear, editar, eliminar, buscar)
- ✅ Gestión de trabajos (estados: pending → completed → invoiced)
- ✅ Facturas automáticas en PDF
- ✅ Autenticación segura (Supabase Auth)
- ✅ Dashboard con métricas en tiempo real
- ✅ Totalmente GRATIS para empezar

---

## ⚡ Empezar en 3 Pasos

### Paso 1️⃣: Lee SETUP.md (5 minutos)

Abre `SETUP.md` y sigue los 4 pasos:
1. Crear Supabase
2. Crear Vercel
3. Setup local
4. Deploy

**Es super sencillo**, cada paso tiene instrucciones claras.

### Paso 2️⃣: Copia los archivos (2 minutos)

Todos los archivos están listos aquí en `/home/claude/ClientFlow`. Solo tienes que:

```bash
# En tu PC (terminal):
cd /wherever/you/want
git clone https://github.com/TU_USER/ClientFlow.git
# O descarga como ZIP si no tienes Git
```

### Paso 3️⃣: Corre en local (1 minuto)

```bash
npm install
npm run dev
# Abre http://localhost:3000
```

---

## 📂 Qué hay aquí

```
ClientFlow/
├── README.md              ← Descripción general
├── SETUP.md               ← Guía de instalación (¡LEE ESTO!)
├── COMIENZA_AQUI.md       ← Este archivo
├── setup.sql              ← Copiar/pegar en Supabase
├── package.json           ← Dependencias
├── app/
│   ├── page.jsx           ← Landing (público)
│   ├── layout.jsx         ← Layout base
│   ├── globals.css        ← Estilos globales
│   ├── auth/
│   │   ├── login/page.jsx
│   │   └── signup/page.jsx
│   └── dashboard/
│       ├── page.jsx       ← Dashboard (stats)
│       ├── clients/       ← Gestión de clientes
│       ├── jobs/          ← Gestión de trabajos
│       └── invoices/      ← Gestión de facturas
├── components/
│   └── Navbar.jsx         ← Barra de navegación
├── context/
│   └── AuthContext.jsx    ← Auth logic
├── lib/
│   ├── supabase.js        ← Cliente Supabase
│   └── invoiceGenerator.js ← Generar PDFs
└── .env.local.example     ← Copiar a .env.local
```

---

## 🎯 Tu Workflow

### Semana 1: Setup + Testing
1. Sigue SETUP.md
2. Crea tu cuenta
3. Prueba: crea 3 clientes, 3 trabajos, 1 factura
4. Descarga el PDF

### Semana 2: Primeros 5 Clientes
1. Invita a 5 jardineros/plomeros que conoces
2. Cuéntales: "Prueba gratis 14 días"
3. Recopila feedback

### Semana 3: Stripe + Pago
1. Crea cuenta Stripe
2. Integra botón de pago
3. Cobra los primeros 19,99€/mes

### Mes 2+: Growth
1. WhatsApp automático (Make.com)
2. LinkedIn ads
3. Referrals

---

## 💰 El Modelo

| Cuando | Precio | Usuarios | Ingresos |
|--------|--------|----------|----------|
| Semana 1 | Gratis | - | €0 |
| Mes 1 | 19,99€ | 2-5 | €40-100 |
| Mes 3 | 19,99€ | 20+ | €400+ |
| Mes 6 | 19,99€ | 50+ | €1,000+ |
| Mes 12 | 19,99€ | 100+ | €2,000+ |

**Con 100 usuarios a 19,99€ = €1,999/mes = ¡tu salario!**

---

## ❓ Preguntas Frecuentes

**¿Cuesta dinero?**
- Supabase: GRATIS hasta 500MB (es infinito para MVP)
- Vercel: GRATIS
- Stripe: 0€ hasta que cobres, luego 2.9% + €0.30

**¿Qué pasa después de 14 días?**
- Nada. Los usuarios no pagan si no quieren. Pero el app es tan bueno que pagará después de probar.

**¿Cómo le digo a mi jefe de Mediterraneum?**
- "He creado un MVP de CRM para servicios. Querría mostrarte en 2 semanas."
- Presenta en dashboard en vivo
- Pídele que lo use 1 mes gratis
- Si le gusta → negocia un plan especial

**¿Y si quiero agregar WhatsApp automático?**
- Eso lo hacemos en semana 4 cuando confirmes que el MVP funciona.

**¿Puedo vender esto a otros?**
- SÍ. Es tu producto. Lo que ganes es 100% tuyo.

---

## 🔑 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Correr en desarrollo (http://localhost:3000)
npm run dev

# Build para producción
npm run build

# Deploy (solo después de push a GitHub)
# En Vercel: se hace automático
```

---

## 🎨 Customización Básica

### Cambiar colores:
- Verde oscuro: `#1a2e1a` → Edita en `tailwind.config.js`
- Oro: `#c9a84c` → Igual
- Crema: `#f5f0e8` → Igual

### Cambiar nombre:
- Busca "ClientFlow" en `components/Navbar.jsx`
- Reemplaza con "Mi App"

### Agregar logo:
- Sube logo a `/public`
- Cambia en `components/Navbar.jsx` la línea del logo

---

## 🆘 Si algo no funciona

### Error: "Module not found"
```bash
npm install
npm install --legacy-peer-deps
```

### Error: "Cannot connect to Supabase"
- Verifica `.env.local` tiene las keys correctas
- Reinicia `npm run dev`

### Error: "Styles are broken"
```bash
# Limpia next cache
rm -rf .next
npm run dev
```

### Error: "Cannot push to GitHub"
```bash
git config --global user.email "tu@email.com"
git config --global user.name "Tu Nombre"
```

---

## 📞 Soporte

Si necesitas ayuda:
1. Revisa el error en la consola (F12)
2. Busca la solución en SETUP.md
3. Pregunta en el chat (Kael)

---

## 🎯 Checklist Antes de Empezar

- [ ] Leído SETUP.md
- [ ] Creada cuenta Supabase
- [ ] Creada cuenta Vercel
- [ ] Ejecutado setup.sql
- [ ] Copié `.env.local.example` a `.env.local`
- [ ] Pegué mis keys en `.env.local`
- [ ] Corrí `npm install` sin errores
- [ ] Corrí `npm run dev` sin errores
- [ ] Abierto http://localhost:3000
- [ ] Creé una cuenta de prueba
- [ ] Agregué un cliente
- [ ] Creé un trabajo
- [ ] Generé una factura en PDF

**Cuando tengas TODO ✅**, estás listo para empezar.

---

## 🚀 TU OBJETIVO

**En 1 semana:**
- App funcionando localmente
- 5 clientes probando gratis

**En 1 mes:**
- 10-15 clientes pagos
- €200-300 de ingresos

**En 3 meses:**
- 50+ clientes
- €1,000+/mes
- Presentación a Mediterraneum

---

**Ahora sí. A codear. 💪**

Lee SETUP.md y comienza.
