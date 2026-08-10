'use client'

import { Download, FileSpreadsheet } from 'lucide-react'
import { exportReportToPdf, exportReportToExcel, type ReportExportLabels } from '@/utils/reportExport'
import { useTranslation } from '@/hooks/useTranslation'
import { toBCP47 } from '@/utils/i18n'

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
  const { t, locale } = useTranslation()
  const labels: ReportExportLabels = {
    reportOf: t('reports.exportReportOf'),
    generated: t('reports.exportGenerated'),
    month: t('reports.exportMonth'),
    revenue: t('reports.exportRevenue'),
    margin: t('reports.exportMargin'),
    hours: t('reports.exportHours'),
    totals: t('reports.exportTotals'),
    totalLabel: t('reports.exportTotalLabel'),
    sheetName: t('reports.exportSheetName'),
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => exportReportToPdf(report, businessName, labels, toBCP47(locale))}
        className="btn-secondary flex items-center gap-2 text-sm"
        title={t('reports.exportPdf')}
      >
        <Download size={16} /> PDF
      </button>
      <button
        onClick={() => exportReportToExcel(report, businessName, labels, toBCP47(locale))}
        className="btn-secondary flex items-center gap-2 text-sm"
        title={t('reports.exportExcel')}
      >
        <FileSpreadsheet size={16} /> Excel
      </button>
    </div>
  )
}
