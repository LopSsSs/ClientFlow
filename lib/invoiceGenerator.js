import jsPDF from 'jspdf'
import { buildPaypalPaymentUrl } from './paypal'

const CURRENCY_SYMBOLS = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF ', SEK: 'kr ', NOK: 'kr ', DKK: 'kr ', CZK: 'Kč ' }

function currencySymbol(code) {
  return CURRENCY_SYMBOLS[code] || (code ? `${code} ` : '€')
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null
}

// jsPDF.addImage no admite una URL remota (ni en navegador ni en servidor):
// hay que descargarla y convertirla a data URI antes. Si falla la descarga o
// el formato no es compatible con jsPDF (WEBP no lo es en la versión que
// usamos), se ignora el logo en vez de romper la generación del PDF.
async function urlToDataUri(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || 'image/png'
    if (contentType.includes('webp')) return null
    const buffer = await res.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
    const base64 = typeof Buffer !== 'undefined' ? Buffer.from(bytes).toString('base64') : btoa(binary)
    const format = contentType.includes('jpeg') || contentType.includes('jpg') ? 'JPEG' : 'PNG'
    return { dataUri: `data:${contentType};base64,${base64}`, format }
  } catch {
    return null
  }
}

// businessData acepta tanto el objeto `businesses` (name, phone,
// whatsapp_number) como, opcionalmente, los campos de business_settings
// (logo_url, color_primary/secondary, company_*, payment_*,
// invoice_terms_text, currency, tax_name) — todos con fallback al diseño
// verde/dorado original cuando el negocio no los ha configurado.
export async function generateInvoicePDF(invoiceData, businessData) {
  const doc = new jsPDF()

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin

  const primaryRgb = hexToRgb(businessData.color_primary) || [26, 46, 26] // #1a2e1a
  const accentRgb = hexToRgb(businessData.color_secondary) || [201, 168, 76] // #c9a84c
  const symbol = currencySymbol(businessData.currency)
  const taxLabel = businessData.tax_name || 'IVA'

  const logo = businessData.logo_url ? await urlToDataUri(businessData.logo_url) : null

  // Header
  doc.setFillColor(...primaryRgb)
  doc.rect(0, 0, pageWidth, 30, 'F')

  const nameX = logo ? margin + 24 : margin
  if (logo) {
    doc.addImage(logo.dataUri, logo.format, margin, 5, 20, 20)
  }

  doc.setTextColor(...accentRgb)
  doc.setFontSize(20)
  doc.text(businessData.name || 'ClientFlow', nameX, 20, { maxWidth: contentWidth - 55 - (logo ? 24 : 0) })

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.text(`FACTURA #${invoiceData.invoice_number}`, pageWidth - margin, 20, { align: 'right' })

  // Business info
  let bizY = 45
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text(`${businessData.name}`, margin, bizY)
  bizY += 7
  if (businessData.company_cif) {
    doc.text(`CIF/NIF: ${businessData.company_cif}`, margin, bizY)
    bizY += 7
  }
  doc.text(`Teléfono: ${businessData.phone || '-'}`, margin, bizY)
  bizY += 7
  doc.text(`WhatsApp: ${businessData.whatsapp_number || '-'}`, margin, bizY)
  bizY += 7
  if (businessData.company_email) {
    doc.text(`Email: ${businessData.company_email}`, margin, bizY)
    bizY += 7
  }
  if (businessData.company_address) {
    doc.text(businessData.company_address, margin, bizY, { maxWidth: contentWidth / 2 })
    bizY += 7
  }

  // Client info
  let clientY = Math.max(75, bizY + 3)
  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.text('Facturado a:', margin, clientY)

  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  clientY += 7
  doc.text(invoiceData.client_name, margin, clientY)
  clientY += 7
  doc.text(`Email: ${invoiceData.client_email || '-'}`, margin, clientY)
  clientY += 7
  doc.text(`Teléfono: ${invoiceData.client_phone || '-'}`, margin, clientY)
  if (invoiceData.client_address) {
    clientY += 7
    doc.text(invoiceData.client_address, margin, clientY)
  }

  // Invoice details
  let yPosition = Math.max(120, clientY + 10)

  // Cabecera de tabla: fondo verde oscuro + texto blanco (el dorado de fondo
  // con texto blanco encima daba muy poco contraste y era difícil de leer)
  doc.setFillColor(...primaryRgb)
  doc.rect(margin, yPosition - 5, contentWidth, 8, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(10)
  doc.text('Descripción', margin + 5, yPosition + 1)
  doc.text('Monto', pageWidth - margin - 10, yPosition + 1, { align: 'right' })

  yPosition += 15
  doc.setTextColor(20, 20, 20)
  doc.setFont(undefined, 'normal')

  // Items
  const items = invoiceData.items || [
    {
      description: invoiceData.description || 'Servicio prestado',
      amount: invoiceData.amount,
    },
  ]

  items.forEach((item) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage()
      yPosition = 20
    }

    doc.text(item.description, margin + 5, yPosition)
    doc.text(`${symbol}${item.amount.toFixed(2)}`, pageWidth - margin - 10, yPosition, {
      align: 'right',
    })
    yPosition += 8
  })

  // Totals
  // invoiceData.amount es el importe SIN IVA (así lo tratan la página de pago
  // y el cobro real en Stripe: total = amount + tax) — antes este archivo
  // asumía lo contrario (amount - tax) y el PDF mostraba un total distinto
  // al que realmente se cobraba al cliente.
  const subtotal = invoiceData.amount
  const total = invoiceData.amount + invoiceData.tax
  yPosition += 10

  // Subtotal: fondo neutro claro, texto gris oscuro sin negrita — el menos
  // destacado de los tres, para que el TOTAL sea el que llame la atención
  doc.setFillColor(245, 240, 232) // #f5f0e8
  doc.rect(pageWidth - margin - 70, yPosition, 65, 8, 'F')

  doc.setTextColor(90, 90, 90)
  doc.setFont(undefined, 'normal')
  doc.text('Subtotal:', pageWidth - margin - 65, yPosition + 5, { align: 'right' })
  doc.text(`${symbol}${subtotal.toFixed(2)}`, pageWidth - margin - 5, yPosition + 5, {
    align: 'right',
  })

  yPosition += 10

  if (invoiceData.tax > 0) {
    const taxRate = subtotal > 0 ? Math.round((invoiceData.tax / subtotal) * 100) : 0

    doc.setFillColor(245, 240, 232)
    doc.rect(pageWidth - margin - 70, yPosition, 65, 8, 'F')

    doc.setTextColor(90, 90, 90)
    doc.text(`${taxLabel} (${taxRate}%):`, pageWidth - margin - 65, yPosition + 5, { align: 'right' })
    doc.text(`${symbol}${invoiceData.tax.toFixed(2)}`, pageWidth - margin - 5, yPosition + 5, {
      align: 'right',
    })
    yPosition += 10
  }

  // Total: fondo verde oscuro + texto dorado, igual que la cabecera —
  // el bloque con más contraste y peso visual de los tres
  doc.setFillColor(...primaryRgb)
  doc.rect(pageWidth - margin - 70, yPosition, 65, 10, 'F')

  doc.setTextColor(...accentRgb)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL:', pageWidth - margin - 65, yPosition + 6, { align: 'right' })
  doc.text(`${symbol}${total.toFixed(2)}`, pageWidth - margin - 5, yPosition + 6, {
    align: 'right',
  })

  // CTA principal de pago: PayPal > Bizum > transferencia > enlace de pago
  // online genérico (Stripe, vía la página /pay). El negocio elige el
  // método rellenando (o no) cada campo en su configuración de facturas —
  // el primero que tenga configurado es el que se destaca aquí.
  const primaryMethod = businessData.payment_paypal_email
    ? 'paypal'
    : businessData.payment_bizum_phone
      ? 'bizum'
      : businessData.payment_transfer_enabled && businessData.payment_transfer_iban
        ? 'transfer'
        : null

  if (primaryMethod || invoiceData.id) {
    yPosition += 15
    doc.setTextColor(...accentRgb)
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')

    if (primaryMethod === 'paypal') {
      doc.textWithLink('Paga con PayPal ->', margin, yPosition, {
        url: buildPaypalPaymentUrl(
          businessData.payment_paypal_email,
          total,
          businessData.currency || 'EUR',
          `Factura ${invoiceData.invoice_number}`
        ),
      })
    } else if (primaryMethod === 'bizum') {
      doc.text(`Paga por Bizum al ${businessData.payment_bizum_phone}`, margin, yPosition)
    } else if (primaryMethod === 'transfer') {
      doc.text(`Transferencia bancaria: ${businessData.payment_transfer_iban}`, margin, yPosition)
    } else {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      doc.textWithLink('Pincha aquí para pagar esta factura online ->', margin, yPosition, {
        url: `${appUrl}/pay/${invoiceData.id}`,
      })
    }
  }

  // Métodos de pago adicionales (opcional, viene de business_settings) — se
  // omite el que ya se muestra como CTA principal arriba, para no repetirlo.
  let extraY = yPosition + (primaryMethod || invoiceData.id ? 15 : 10)
  const otherPaypal = primaryMethod !== 'paypal' && businessData.payment_paypal_email
  const otherBizum = primaryMethod !== 'bizum' && businessData.payment_bizum_phone
  const otherTransfer =
    primaryMethod !== 'transfer' && businessData.payment_transfer_enabled && businessData.payment_transfer_iban

  if (otherPaypal || otherBizum || otherTransfer) {
    if (extraY > pageHeight - 55) {
      doc.addPage()
      extraY = 20
    }
    doc.setTextColor(20, 20, 20)
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text('Otros métodos de pago:', margin, extraY)
    doc.setFont(undefined, 'normal')
    extraY += 6
    if (otherPaypal) {
      doc.text(`PayPal: ${businessData.payment_paypal_email}`, margin, extraY)
      extraY += 5
    }
    if (otherBizum) {
      doc.text(`Bizum: ${businessData.payment_bizum_phone}`, margin, extraY)
      extraY += 5
    }
    if (otherTransfer) {
      doc.text(`Transferencia: ${businessData.payment_transfer_iban}`, margin, extraY)
      extraY += 5
    }
  }

  // Términos y condiciones (opcional, viene de business_settings)
  if (businessData.invoice_terms_text) {
    if (extraY > pageHeight - 30) {
      doc.addPage()
      extraY = 20
    }
    doc.setTextColor(85, 85, 85)
    doc.setFontSize(8)
    doc.setFont(undefined, 'italic')
    doc.text(businessData.invoice_terms_text, margin, extraY + 8, { maxWidth: contentWidth })
  }

  // Footer
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.text(
    `Emitida: ${new Date().toLocaleDateString('es-ES')}`,
    margin,
    pageHeight - 10
  )
  if (invoiceData.due_date) {
    doc.text(
      `Vencimiento: ${new Date(invoiceData.due_date).toLocaleDateString('es-ES')}`,
      pageWidth - margin - 50,
      pageHeight - 10
    )
  }

  return doc
}

export function downloadInvoice(doc, invoiceNumber) {
  doc.save(`factura-${invoiceNumber}.pdf`)
}

export function getInvoicePdfAsBlob(doc) {
  return doc.output('blob')
}
