'use client'

import { Download, FileSpreadsheet } from 'lucide-react'
import { exportReportToPdf, exportReportToExcel } from '@/utils/reportExport'

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

interface ReportExportButtonsProps {
  report: MonthlyReport
  businessName: string
}

export default function ReportExportButtons({ report, businessName }: ReportExportButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => exportReportToPdf(report, businessName)}
        className="btn-secondary flex items-center gap-2 text-sm"
        title="Exportar a PDF"
      >
        <Download size={16} /> PDF
      </button>
      <button
        onClick={() => exportReportToExcel(report, businessName)}
        className="btn-secondary flex items-center gap-2 text-sm"
        title="Exportar a Excel"
      >
        <FileSpreadsheet size={16} /> Excel
      </button>
    </div>
  )
}
