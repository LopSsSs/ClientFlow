'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import { getDashboardStats } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'
import Link from 'next/link'
import { Users, Briefcase, FileText, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { user, business, loading } = useAuth()
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (business?.id) {
      loadStats()
    }
  }, [business])

  const loadStats = async () => {
    try {
      const data = await getDashboardStats(business.id)
      
      const jobStats = {
        total: data.jobs.length,
        pending: data.jobs.filter(j => j.status === 'pending').length,
        completed: data.jobs.filter(j => j.status === 'completed').length,
        revenue: data.jobs.reduce((sum, j) => sum + (j.total_amount || 0), 0),
      }

      const clientStats = {
        total: data.clients.length,
      }

      const invoiceStats = {
        total: data.invoices.length,
        paid: data.invoices.filter(i => i.status === 'paid').length,
        pending: data.invoices.filter(i => i.status === 'pending').length,
        revenue: data.invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
      }

      setStats({
        jobs: jobStats,
        clients: clientStats,
        invoices: invoiceStats,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{t('common.loading')}</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-light">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            {t('dashboard.welcome', { name: business?.name || '' })}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.summary')}
          </p>
        </div>

        {/* Stats Grid */}
        {!loadingStats && stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Clients Card */}
              <Link href="/dashboard/clients">
                <div className="card cursor-pointer hover:shadow-lg transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">{t('dashboard.clients')}</p>
                      <h3 className="text-3xl font-bold text-primary">
                        {stats.clients.total}
                      </h3>
                    </div>
                    <Users className="text-accent" size={40} />
                  </div>
                </div>
              </Link>

              {/* Jobs Card */}
              <Link href="/dashboard/jobs">
                <div className="card cursor-pointer hover:shadow-lg transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">{t('dashboard.jobs')}</p>
                      <h3 className="text-3xl font-bold text-primary">
                        {stats.jobs.total}
                      </h3>
                      <p className="text-xs text-yellow-600 mt-1">
                        {stats.jobs.pending} {t('dashboard.pending')}
                      </p>
                    </div>
                    <Briefcase className="text-accent" size={40} />
                  </div>
                </div>
              </Link>

              {/* Invoices Card */}
              <Link href="/dashboard/invoices">
                <div className="card cursor-pointer hover:shadow-lg transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">{t('dashboard.invoices')}</p>
                      <h3 className="text-3xl font-bold text-primary">
                        {stats.invoices.total}
                      </h3>
                      <p className="text-xs text-red-600 mt-1">
                        {stats.invoices.pending} {t('dashboard.pending')}
                      </p>
                    </div>
                    <FileText className="text-accent" size={40} />
                  </div>
                </div>
              </Link>

              {/* Revenue Card */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-2">{t('dashboard.revenuePaid')}</p>
                    <h3 className="text-3xl font-bold text-green-600">
                      €{stats.invoices.revenue.toFixed(2)}
                    </h3>
                  </div>
                  <TrendingUp className="text-green-600" size={40} />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h3 className="text-xl font-bold text-primary mb-4">{t('dashboard.quickActions')}</h3>
                <div className="flex gap-2 flex-wrap">
                  <Link
                    href="/dashboard/clients"
                    className="btn-primary"
                  >
                    {t('dashboard.addClient')}
                  </Link>
                  <Link
                    href="/dashboard/jobs"
                    className="btn-accent"
                  >
                    {t('dashboard.createJob')}
                  </Link>
                  <Link
                    href="/dashboard/invoices"
                    className="btn-secondary"
                  >
                    {t('dashboard.viewInvoices')}
                  </Link>
                </div>
              </div>

              {/* Business Info */}
              <div className="card">
                <h3 className="text-xl font-bold text-primary mb-4">{t('dashboard.businessInfo')}</h3>
                <div className="space-y-2">
                  <p><span className="font-semibold">{t('dashboard.name')}</span> {business?.name}</p>
                  <p><span className="font-semibold">{t('dashboard.phone')}</span> {business?.phone || '-'}</p>
                  <p><span className="font-semibold">{t('dashboard.whatsapp')}</span> {business?.whatsapp_number || '-'}</p>
                  <Link
                    href="/dashboard/settings"
                    className="text-accent hover:underline text-sm mt-4 block"
                  >
                    {t('dashboard.editInfo')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="card">
              <h3 className="text-xl font-bold text-primary mb-4">{t('dashboard.monthlySummary')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: t('dashboard.thisMonth'),
                      [t('dashboard.clients')]: stats.clients.total,
                      [t('dashboard.jobs')]: stats.jobs.total,
                      [t('dashboard.invoices')]: stats.invoices.total,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={t('dashboard.clients')} fill="#1a2e1a" />
                  <Bar dataKey={t('dashboard.jobs')} fill="#c9a84c" />
                  <Bar dataKey={t('dashboard.invoices')} fill="#8b7355" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="spinner mx-auto"></div>
            <p className="mt-4">{t('dashboard.loadingData')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
