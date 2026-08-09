import jsPDF from 'jspdf'
import { monthLabel } from './months'

interface MonthlyReportRow {
  month: string
  revenue: number
  margin: number
  hours: number
}

interface MonthlyReport {
  months: MonthlyReportRow[]
  totals: { revenue: number; margin: number; marginPercent: number; hours: number }
}

export function exportReportToPdf(report: MonthlyReport, businessName: string): void {
  const doc = new jsPDF()
  const margin = 15

  doc.setFontSize(18)
  doc.text(`Reporte de ${businessName}`, margin, 20)
  doc.setFontSize(10)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, margin, 27)

  let y = 40
  doc.setFont('helvetica', 'bold')
  doc.text('Mes', margin, y)
  doc.text('Ingresos', margin + 50, y)
  doc.text('Margen', margin + 90, y)
  doc.text('Horas', margin + 130, y)
  doc.setFont('helvetica', 'normal')

  for (const row of report.months) {
    y += 8
    doc.text(monthLabel(row.month), margin, y)
    doc.text(`€${row.revenue.toFixed(2)}`, margin + 50, y)
    doc.text(`€${row.margin.toFixed(2)}`, margin + 90, y)
    doc.text(`${row.hours.toFixed(1)} h`, margin + 130, y)
  }

  y += 12
  doc.setFont('helvetica', 'bold')
  doc.text('Totales', margin, y)
  doc.text(`€${report.totals.revenue.toFixed(2)}`, margin + 50, y)
  doc.text(`€${report.totals.margin.toFixed(2)} (${report.totals.marginPercent.toFixed(0)}%)`, margin + 90, y)
  doc.text(`${report.totals.hours.toFixed(1)} h`, margin + 130, y)

  doc.save(`reporte-${businessName.toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

// xlsx pesa varios cientos de KB: se carga solo al exportar, no en el bundle
// inicial de la página de Reportes.
export async function exportReportToExcel(report: MonthlyReport, businessName: string): Promise<void> {
  const XLSX = await import('xlsx')

  const rows = report.months.map((row) => ({
    Mes: monthLabel(row.month),
    Ingresos: Number(row.revenue.toFixed(2)),
    Margen: Number(row.margin.toFixed(2)),
    Horas: Number(row.hours.toFixed(1)),
  }))
  rows.push({
    Mes: 'Total',
    Ingresos: Number(report.totals.revenue.toFixed(2)),
    Margen: Number(report.totals.margin.toFixed(2)),
    Horas: Number(report.totals.hours.toFixed(1)),
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')
  XLSX.writeFile(workbook, `reporte-${businessName.toLowerCase().replace(/\s+/g, '-')}.xlsx`)
}
