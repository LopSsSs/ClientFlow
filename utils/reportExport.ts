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

export interface ReportExportLabels {
  reportOf: string
  generated: string
  month: string
  revenue: string
  margin: string
  hours: string
  totals: string
  totalLabel: string
  sheetName: string
}

export function exportReportToPdf(
  report: MonthlyReport,
  businessName: string,
  labels: ReportExportLabels,
  bcp47Locale = 'es-ES'
): void {
  const doc = new jsPDF()
  const margin = 15

  doc.setFontSize(18)
  doc.text(`${labels.reportOf} ${businessName}`, margin, 20)
  doc.setFontSize(10)
  doc.text(`${labels.generated} ${new Date().toLocaleDateString(bcp47Locale)}`, margin, 27)

  let y = 40
  doc.setFont('helvetica', 'bold')
  doc.text(labels.month, margin, y)
  doc.text(labels.revenue, margin + 50, y)
  doc.text(labels.margin, margin + 90, y)
  doc.text(labels.hours, margin + 130, y)
  doc.setFont('helvetica', 'normal')

  for (const row of report.months) {
    y += 8
    doc.text(monthLabel(row.month, bcp47Locale), margin, y)
    doc.text(`€${row.revenue.toFixed(2)}`, margin + 50, y)
    doc.text(`€${row.margin.toFixed(2)}`, margin + 90, y)
    doc.text(`${row.hours.toFixed(1)} h`, margin + 130, y)
  }

  y += 12
  doc.setFont('helvetica', 'bold')
  doc.text(labels.totals, margin, y)
  doc.text(`€${report.totals.revenue.toFixed(2)}`, margin + 50, y)
  doc.text(`€${report.totals.margin.toFixed(2)} (${report.totals.marginPercent.toFixed(0)}%)`, margin + 90, y)
  doc.text(`${report.totals.hours.toFixed(1)} h`, margin + 130, y)

  doc.save(`reporte-${businessName.toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

// xlsx pesa varios cientos de KB: se carga solo al exportar, no en el bundle
// inicial de la página de Reportes.
export async function exportReportToExcel(
  report: MonthlyReport,
  businessName: string,
  labels: ReportExportLabels,
  bcp47Locale = 'es-ES'
): Promise<void> {
  const XLSX = await import('xlsx')

  const rows = report.months.map((row) => ({
    [labels.month]: monthLabel(row.month, bcp47Locale),
    [labels.revenue]: Number(row.revenue.toFixed(2)),
    [labels.margin]: Number(row.margin.toFixed(2)),
    [labels.hours]: Number(row.hours.toFixed(1)),
  }))
  rows.push({
    [labels.month]: labels.totalLabel,
    [labels.revenue]: Number(report.totals.revenue.toFixed(2)),
    [labels.margin]: Number(report.totals.margin.toFixed(2)),
    [labels.hours]: Number(report.totals.hours.toFixed(1)),
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, labels.sheetName)
  XLSX.writeFile(workbook, `reporte-${businessName.toLowerCase().replace(/\s+/g, '-')}.xlsx`)
}
