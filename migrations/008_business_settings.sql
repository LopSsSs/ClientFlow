-- Personalización de facturas: logo, colores, datos fiscales, métodos de
-- pago y país/impuesto por negocio. Un registro por negocio (UNIQUE).
-- updated_at se fija con NOW() en cada UPDATE desde la app (igual que
-- businesses/invoices), no con trigger: el proyecto no usa triggers en
-- ningún otro sitio y scripts/apply-migrations.mjs divide el fichero por
-- el caracter de punto y coma de forma ingenua, lo que rompería un
-- CREATE FUNCTION con cuerpo entre dolares.

CREATE TABLE IF NOT EXISTS business_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Identidad visual
  logo_url VARCHAR(500),
  color_primary VARCHAR(7) DEFAULT '#FF6B35',
  color_secondary VARCHAR(7) DEFAULT '#1f2937',

  -- Datos empresa (para el pie/cabecera de la factura)
  company_name VARCHAR(100),
  company_address TEXT,
  company_phone VARCHAR(20),
  company_email VARCHAR(100),
  company_cif VARCHAR(15),

  -- Métodos de pago
  payment_paypal_email VARCHAR(100),
  payment_bizum_phone VARCHAR(20),
  payment_transfer_enabled BOOLEAN DEFAULT false,
  payment_transfer_iban VARCHAR(34),

  -- Términos y condiciones
  invoice_terms_text TEXT,

  -- País y tax dinámico
  country VARCHAR(2) DEFAULT 'ES',
  currency VARCHAR(3) DEFAULT 'EUR',
  tax_name VARCHAR(50) DEFAULT 'IVA',
  tax_rate DECIMAL(5,4) DEFAULT 0.21,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(business_id)
);

CREATE INDEX IF NOT EXISTS idx_business_settings_business_id ON business_settings(business_id);
