import jsPDF from 'jspdf'

export function generateInvoicePDF(invoiceData, businessData) {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin

  // Header
  doc.setFillColor(26, 46, 26) // #1a2e1a
  doc.rect(0, 0, pageWidth, 30, 'F')
  
  doc.setTextColor(201, 168, 76) // #c9a84c
  doc.setFontSize(24)
  doc.text(businessData.name || 'ClientFlow', margin, 20)
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.text(`FACTURA #${invoiceData.invoice_number}`, pageWidth - margin - 50, 20)

  // Business info
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text(`${businessData.name}`, margin, 45)
  doc.text(`Teléfono: ${businessData.phone || '-'}`, margin, 52)
  doc.text(`WhatsApp: ${businessData.whatsapp_number || '-'}`, margin, 59)

  // Client info
  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.text('Facturado a:', margin, 75)
  
  doc.setFont(undefined, 'normal')
  doc.setFontSize(10)
  doc.text(invoiceData.client_name, margin, 82)
  doc.text(`Email: ${invoiceData.client_email || '-'}`, margin, 89)
  doc.text(`Teléfono: ${invoiceData.client_phone || '-'}`, margin, 96)
  if (invoiceData.client_address) {
    doc.text(invoiceData.client_address, margin, 103)
  }

  // Invoice details
  let yPosition = 120
  
  doc.setFillColor(201, 168, 76)
  doc.rect(margin, yPosition - 5, contentWidth, 8, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFont(undefined, 'bold')
  doc.setFontSize(10)
  doc.text('Descripción', margin + 5, yPosition + 1)
  doc.text('Monto', pageWidth - margin - 30, yPosition + 1, { align: 'right' })

  yPosition += 15
  doc.setTextColor(0, 0, 0)
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
    doc.text(`€${item.amount.toFixed(2)}`, pageWidth - margin - 10, yPosition, {
      align: 'right',
    })
    yPosition += 8
  })

  // Totals
  yPosition += 10
  
  doc.setFillColor(245, 240, 232) // #f5f0e8
  doc.rect(pageWidth - margin - 70, yPosition, 65, 8, 'F')
  
  doc.setFont(undefined, 'bold')
  doc.text('Subtotal:', pageWidth - margin - 65, yPosition + 5, { align: 'right' })
  doc.text(
    `€${(invoiceData.amount - invoiceData.tax).toFixed(2)}`,
    pageWidth - margin - 5,
    yPosition + 5,
    { align: 'right' }
  )

  yPosition += 10
  
  if (invoiceData.tax > 0) {
    doc.rect(pageWidth - margin - 70, yPosition, 65, 8, 'F')
    doc.text('IVA:', pageWidth - margin - 65, yPosition + 5, { align: 'right' })
    doc.text(`€${invoiceData.tax.toFixed(2)}`, pageWidth - margin - 5, yPosition + 5, {
      align: 'right',
    })
    yPosition += 10
  }

  doc.setFillColor(26, 46, 26)
  doc.rect(pageWidth - margin - 70, yPosition, 65, 10, 'F')
  
  doc.setTextColor(201, 168, 76)
  doc.setFontSize(12)
  doc.text('TOTAL:', pageWidth - margin - 65, yPosition + 6, { align: 'right' })
  doc.text(`€${invoiceData.amount.toFixed(2)}`, pageWidth - margin - 5, yPosition + 6, {
    align: 'right',
  })

  // Enlace de pago (solo si conocemos el id de la factura)
  if (invoiceData.id) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    yPosition += 15
    doc.setTextColor(201, 168, 76)
    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.textWithLink('Pagar esta factura online ->', margin, yPosition, {
      url: `${appUrl}/pay/${invoiceData.id}`,
    })
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
