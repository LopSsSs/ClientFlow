'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import { getMonthlyReport } from '@/lib/api'
import { monthLabel } from '@/utils/months'
import ReportExportButtons from '@/components/reports/ReportExportButtons'
import SatisfactionSummary from '@/components/reports/SatisfactionSummary'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

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

const RANGE_OPTIONS = [
  { label: '6 meses', value: 6 },
  { label: '12 meses', value: 12 },
]

export default function ReportsPage() {
  const { business, loading } = useAuth()
  const [months, setMonths] = useState(6)
  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(true)

  useEffect(() => {
    if (!business?.id) return
    setLoadingReport(true)
    getMonthlyReport(months)
      .then(setReport)
      .finally(() => setLoadingReport(false))
  }, [business, months])

  if (loading || loadingReport || !report) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  const chartData = report.months.map((m) => ({ ...m, label: monthLabel(m.month) }))

  return (
    <div className="min-h-screen bg-light">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-4xl font-bold text-primary">Reportes</h1>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMonths(opt.value)}
                  className={`px-4 py-2 rounded-lg transition ${
                    months === opt.value
                      ? 'bg-primary text-light'
                      : 'bg-white text-primary border border-primary hover:bg-light'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <ReportExportButtons report={report} businessName={business?.name || 'ClientFlow'} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card">
            <p className="text-gray-600 text-sm">Ingresos cobrados</p>
            <p className="text-3xl font-bold text-primary">€{report.totals.revenue.toFixed(2)}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Margen real</p>
            <p className="text-3xl font-bold text-green-700">
              €{report.totals.margin.toFixed(2)}{' '}
              <span className="text-lg font-medium">({report.totals.marginPercent.toFixed(0)}%)</span>
            </p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Horas trabajadas</p>
            <p className="text-3xl font-bold text-primary">{report.totals.hours.toFixed(1)} h</p>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-bold text-primary mb-4">Ingresos y margen por mes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="revenue" name="Ingresos" fill="#1a2e1a" />
              <Bar dataKey="margin" name="Margen" fill="#c9a84c" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-primary mb-4">Horas trabajadas por mes</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)} h`} />
              <Line type="monotone" dataKey="hours" name="Horas" stroke="#1a2e1a" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <SatisfactionSummary />
      </div>
    </div>
  )
}
