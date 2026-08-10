'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import { getJobs, getClients, createJob, updateJob, deleteJob } from '@/lib/api'
import { estimateLaborCost } from '@/utils/estimator'
import MarginBadge from '@/components/MarginBadge'
import RecurringJobsPanel from '@/components/jobs/RecurringJobsPanel'
import JobPhotosGallery from '@/components/jobs/JobPhotosGallery'
import { useTranslation } from '@/hooks/useTranslation'
import { toBCP47 } from '@/utils/i18n'
import { Edit2, Trash2, Plus, X, Wand2 } from 'lucide-react'

export default function JobsPage() {
  const { business, loading } = useAuth()
  const { t, locale } = useTranslation()
  const [jobs, setJobs] = useState([])
  const [clients, setClients] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    description: '',
    status: 'pending',
    scheduled_date: '',
    completed_date: '',
    duration_hours: '',
    materials_cost: '0',
    labor_cost: '',
    total_amount: '',
    notes: '',
  })

  useEffect(() => {
    if (business?.id) {
      loadJobs()
      loadClients()
    }
  }, [business])

  const loadJobs = async () => {
    try {
      const { data } = await getJobs(business.id)
      setJobs(data || [])
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoadingJobs(false)
    }
  }

  const loadClients = async () => {
    try {
      const { data } = await getClients(business.id)
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const jobData = {
        ...formData,
        duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : 0,
        materials_cost: parseFloat(formData.materials_cost) || 0,
        labor_cost: parseFloat(formData.labor_cost) || 0,
        total_amount: parseFloat(formData.total_amount) || 0,
      }

      if (editingId) {
        await updateJob(editingId, jobData)
      } else {
        await createJob(business.id, jobData)
      }
      resetForm()
      loadJobs()
    } catch (error) {
      alert(t('jobs.saveError', { message: error.message }))
    }
  }

  const resetForm = () => {
    setFormData({
      client_id: '',
      title: '',
      description: '',
      status: 'pending',
      scheduled_date: '',
      completed_date: '',
      duration_hours: '',
      materials_cost: '0',
      labor_cost: '',
      total_amount: '',
      notes: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (job) => {
    setFormData({
      client_id: job.client_id,
      title: job.title,
      description: job.description || '',
      status: job.status,
      scheduled_date: job.scheduled_date ? job.scheduled_date.split('T')[0] : '',
      completed_date: job.completed_date ? job.completed_date.split('T')[0] : '',
      duration_hours: job.duration_hours || '',
      materials_cost: job.materials_cost || '0',
      labor_cost: job.labor_cost || '',
      total_amount: job.total_amount || '',
      notes: job.notes || '',
    })
    setEditingId(job.id)
    setShowForm(true)
  }

  const applyRateEstimate = () => {
    if (!business?.default_hourly_rate) return
    const hours = parseFloat(formData.duration_hours) || 0
    const estimated = estimateLaborCost(hours, business.default_hourly_rate)
    setFormData((prev) => ({ ...prev, labor_cost: estimated.toFixed(2) }))
  }

  const handleDelete = async (jobId) => {
    if (confirm(t('jobs.deleteConfirm'))) {
      try {
        await deleteJob(jobId)
        loadJobs()
      } catch (error) {
        alert(t('jobs.deleteError', { message: error.message }))
      }
    }
  }

  const filteredJobs = statusFilter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === statusFilter)

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      completed: 'badge-success',
      invoiced: 'badge-success',
      paid: 'badge-success',
    }
    return badges[status] || 'badge-pending'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: t('jobs.statusPending'),
      completed: t('jobs.statusCompleted'),
      invoiced: t('jobs.statusInvoiced'),
      paid: t('jobs.statusPaid'),
    }
    return labels[status] || status
  }

  if (loading || loadingJobs) {
    return <div className="flex justify-center items-center h-screen">{t('common.loading')}</div>
  }

  return (
    <div className="min-h-screen bg-light">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">{t('jobs.title')}</h1>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="btn-accent flex items-center gap-2"
          >
            <Plus size={20} /> {t('jobs.createButton')}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { label: t('jobs.filterAll'), value: 'all' },
            { label: t('jobs.filterPending'), value: 'pending' },
            { label: t('jobs.filterCompleted'), value: 'completed' },
            { label: t('jobs.filterInvoiced'), value: 'invoiced' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg transition ${
                statusFilter === filter.value
                  ? 'bg-primary text-light'
                  : 'bg-white text-primary border border-primary hover:bg-light'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">
                  {editingId ? t('jobs.editTitle') : t('jobs.newTitle')}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-primary">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('jobs.clientLabel')}</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">{t('jobs.selectClient')}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('jobs.titleLabel')}</label>
                  <input
                    type="text"
                    placeholder={t('jobs.titlePlaceholder')}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('jobs.descriptionLabel')}</label>
                  <textarea
                    placeholder={t('jobs.descriptionPlaceholder')}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('jobs.scheduledDateLabel')}</label>
                    <input
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('jobs.completedDateLabel')}</label>
                    <input
                      type="date"
                      value={formData.completed_date}
                      onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('jobs.hoursLabel')}</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="0"
                      value={formData.duration_hours}
                      onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('jobs.statusLabel')}</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input-field"
                    >
                      <option value="pending">{t('jobs.statusPending')}</option>
                      <option value="completed">{t('jobs.statusCompleted')}</option>
                      <option value="invoiced">{t('jobs.statusInvoiced')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('jobs.materialsCostLabel')}</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.materials_cost}
                      onChange={(e) => setFormData({ ...formData, materials_cost: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('jobs.laborCostLabel')}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.labor_cost}
                        onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })}
                        className="input-field"
                        required
                      />
                      {business?.default_hourly_rate ? (
                        <button
                          type="button"
                          onClick={applyRateEstimate}
                          title={t('jobs.estimateTooltip', { rate: String(business.default_hourly_rate) })}
                          className="btn-secondary px-3 shrink-0"
                        >
                          <Wand2 size={18} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('jobs.finalPriceLabel')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    className="input-field"
                    required
                  />
                  <div className="mt-2">
                    <MarginBadge
                      finalPrice={parseFloat(formData.total_amount) || 0}
                      laborCost={parseFloat(formData.labor_cost) || 0}
                      materialsCost={parseFloat(formData.materials_cost) || 0}
                    />
                    <span className="text-xs text-gray-500 ml-2">{t('jobs.marginHint')}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('jobs.notesLabel')}</label>
                  <textarea
                    placeholder={t('jobs.notesPlaceholder')}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field h-16"
                  />
                </div>

                {editingId && <JobPhotosGallery jobId={editingId} />}

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="btn-accent flex-1">
                    {editingId ? t('jobs.update') : t('jobs.create')}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-x-auto">
          {filteredJobs.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3 text-left">{t('jobs.colTitle')}</th>
                  <th className="px-4 py-3 text-left">{t('jobs.colClient')}</th>
                  <th className="px-4 py-3 text-left">{t('jobs.colAmount')}</th>
                  <th className="px-4 py-3 text-left">{t('jobs.colMargin')}</th>
                  <th className="px-4 py-3 text-left">{t('jobs.colStatus')}</th>
                  <th className="px-4 py-3 text-left">{t('jobs.colDate')}</th>
                  <th className="px-4 py-3 text-center">{t('jobs.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="table-row">
                    <td className="px-4 py-3 font-semibold">{job.title}</td>
                    <td className="px-4 py-3 text-sm">{job.clients?.name || '-'}</td>
                    <td className="px-4 py-3 font-medium">€{job.total_amount?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <MarginBadge
                        finalPrice={job.total_amount || 0}
                        laborCost={job.labor_cost || 0}
                        materialsCost={job.materials_cost || 0}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getStatusBadge(job.status)}`}>
                        {getStatusLabel(job.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {job.scheduled_date
                        ? new Date(job.scheduled_date).toLocaleDateString(toBCP47(locale))
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEdit(job)}
                        className="text-accent hover:text-primary mr-3"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">{t('jobs.empty')}</p>
              <button
                onClick={() => {
                  resetForm()
                  setShowForm(true)
                }}
                className="btn-accent"
              >
                {t('jobs.createFirst')}
              </button>
            </div>
          )}
        </div>

        <RecurringJobsPanel clients={clients} />
      </div>
    </div>
  )
}
