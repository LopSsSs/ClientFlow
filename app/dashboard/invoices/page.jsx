'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import { getInvoices, getJobs, createInvoice, updateInvoice, deleteInvoice, sendInvoiceEmail } from '@/lib/api'
import { generateInvoicePDF, downloadInvoice } from '@/lib/invoiceGenerator'
import { getOverdueInfo } from '@/utils/collections'
import OverdueBadge from '@/components/OverdueBadge'
import { useTranslation } from '@/hooks/useTranslation'
import { useNotification } from '@/store/notificationStore'
import { toBCP47 } from '@/utils/i18n'
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings'
import { FileText, Trash2, Plus, Download, Edit2, CreditCard, Mail } from 'lucide-react'
import Modal from '@/components/Modal'

export default function InvoicesPage() {
  const { business, user, loading } = useAuth()
  const { t, locale } = useTranslation()
  const { notifyEmail, notifyError } = useNotification()
  const { settings: invoiceSettings } = useInvoiceSettings()
  const [invoices, setInvoices] = useState([])
  const [jobs, setJobs] = useState([])
  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const [sendingEmailId, setSendingEmailId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingOriginalStatus, setEditingOriginalStatus] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    job_id: '',
    client_id: '',
    amount: '',
    tax: '0',
    status: 'pending',
    due_date: '',
  })

  useEffect(() => {
    if (business?.id) {
      loadInvoices()
      loadJobs()
    }
  }, [business])

  const loadInvoices = async () => {
    try {
      const { data } = await getInvoices(business.id)
      setInvoices(data || [])
    } catch (error) {
      console.error('Error loading invoices:', error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  const loadJobs = async () => {
    try {
      const { data } = await getJobs(business.id)
      setJobs(data || [])
    } catch (error) {
      console.error('Error loading jobs:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const invoiceData = {
        ...formData,
        client_id: formData.client_id || jobs.find(j => j.id === formData.job_id)?.client_id,
        amount: parseFloat(formData.amount) || 0,
        tax: parseFloat(formData.tax) || 0,
      }

      if (editingId) {
        await updateInvoice(editingId, invoiceData)
      } else {
        await createInvoice(business.id, { ...invoiceData, invoice_number: `INV-${Date.now()}` })
      }
      resetForm()
      loadInvoices()
    } catch (error) {
      alert(t('invoices.saveError', { message: error.message }))
    }
  }

  const handleEdit = (invoice) => {
    setFormData({
      job_id: invoice.job_id || '',
      client_id: invoice.client_id,
      amount: invoice.amount?.toString() ?? '',
      tax: invoice.tax?.toString() ?? '0',
      status: invoice.status,
      due_date: invoice.due_date ? invoice.due_date.split('T')[0] : '',
    })
    setEditingId(invoice.id)
    setEditingOriginalStatus(invoice.status)
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      job_id: '',
      client_id: '',
      amount: '',
      tax: '0',
      status: 'pending',
      due_date: '',
    })
    setEditingOriginalStatus(null)
    setEditingId(null)
    setShowForm(false)
  }

  const handleDelete = async (invoiceId) => {
    if (confirm(t('invoices.deleteConfirm'))) {
      try {
        await deleteInvoice(invoiceId)
        loadInvoices()
      } catch (error) {
        alert(t('invoices.deleteError', { message: error.message }))
      }
    }
  }

  const generatePDF = async (invoice) => {
    const jobData = jobs.find(j => j.id === invoice.job_id)

    const invoiceData = {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      amount: invoice.amount,
      tax: invoice.tax,
      client_name: invoice.clients?.name || t('invoices.defaultClientName'),
      client_email: invoice.clients?.email || '',
      client_phone: invoice.clients?.phone || '',
      client_address: invoice.clients?.address || '',
      description: jobData?.title || t('invoices.defaultServiceDescription'),
    }

    // Los datos de personalización (logo, colores, país/impuesto, métodos de
    // pago) viven en business_settings, no en `business`. El logo cae de
    // vuelta al del negocio si no hay uno propio para facturas.
    const businessForPdf = {
      name: business.name,
      phone: business.phone,
      whatsapp_number: business.whatsapp_number,
      logo_url: invoiceSettings?.logo_url || business.logo_url || null,
      color_primary: invoiceSettings?.color_primary,
      color_secondary: invoiceSettings?.color_secondary,
      company_cif: invoiceSettings?.company_cif,
      company_email: invoiceSettings?.company_email,
      company_address: invoiceSettings?.company_address,
      payment_paypal_email: invoiceSettings?.payment_paypal_email,
      payment_bizum_phone: invoiceSettings?.payment_bizum_phone,
      payment_transfer_enabled: invoiceSettings?.payment_transfer_enabled,
      payment_transfer_iban: invoiceSettings?.payment_transfer_iban,
      invoice_terms_text: invoiceSettings?.invoice_terms_text,
      currency: invoiceSettings?.currency,
      tax_name: invoiceSettings?.tax_name,
    }

    try {
      const doc = await generateInvoicePDF(invoiceData, businessForPdf)
      downloadInvoice(doc, invoice.invoice_number)
    } catch (error) {
      notifyError(`No se pudo generar el PDF: ${error.message}`)
    }
  }

  const handleSendEmail = async (invoice) => {
    if (!invoice.clients?.email) {
      notifyError('Este cliente no tiene email registrado')
      return
    }
    setSendingEmailId(invoice.id)
    try {
      await sendInvoiceEmail(invoice.id)
      notifyEmail(invoice.clients.email, invoice.invoice_number)
      loadInvoices()
    } catch (error) {
      notifyError(`No se pudo enviar el email: ${error.message}`)
    } finally {
      setSendingEmailId(null)
    }
  }

  const filteredInvoices = statusFilter === 'all'
    ? invoices
    : invoices.filter(inv => inv.status === statusFilter)

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      sent: 'badge-pending',
      paid: 'badge-success',
    }
    return badges[status] || 'badge-pending'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: t('invoices.statusPending'),
      sent: t('invoices.statusSent'),
      paid: t('invoices.statusPaid'),
    }
    return labels[status] || status
  }

  const overdueSummary = invoices.reduce(
    (acc, inv) => {
      const { bucket } = getOverdueInfo(inv.due_date, inv.status)
      if (bucket !== 'none') acc[bucket] += 1
      return acc
    },
    { mild: 0, warning: 0, severe: 0 }
  )

  if (loading || loadingInvoices) {
    return <div className="flex justify-center items-center h-screen">{t('common.loading')}</div>
  }

  return (
    <div className="min-h-screen bg-light">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">{t('invoices.title')}</h1>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="btn-accent flex items-center gap-2"
          >
            <Plus size={20} /> {t('invoices.createButton')}
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { label: t('invoices.filterAll'), value: 'all' },
            { label: t('invoices.filterPending'), value: 'pending' },
            { label: t('invoices.filterSent'), value: 'sent' },
            { label: t('invoices.filterPaid'), value: 'paid' },
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
          <Modal
            title={editingId ? t('invoices.editTitle') : t('invoices.newTitle')}
            onClose={resetForm}
          >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('invoices.jobLabel')}</label>
                  <select
                    value={formData.job_id}
                    disabled={!!editingId}
                    onChange={(e) => {
                      setFormData({ ...formData, job_id: e.target.value })
                      if (e.target.value) {
                        const job = jobs.find(j => j.id === e.target.value)
                        if (job) {
                          setFormData(prev => ({
                            ...prev,
                            amount: job.total_amount.toString(),
                            client_id: job.client_id,
                          }))
                        }
                      }
                    }}
                    className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">{t('invoices.selectJob')}</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} - €{job.total_amount}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('invoices.amountLabel')}</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                    disabled={editingOriginalStatus === 'paid'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('invoices.taxLabel')}</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                    className="input-field disabled:bg-gray-100 disabled:text-gray-500"
                    disabled={editingOriginalStatus === 'paid'}
                  />
                </div>

                {editingOriginalStatus === 'paid' && (
                  <p className="text-xs text-yellow-700 -mt-2">{t('invoices.paidLocked')}</p>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">{t('invoices.dueDateLabel')}</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t('invoices.statusLabel')}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="pending">{t('invoices.statusPending')}</option>
                    <option value="sent">{t('invoices.statusSent')}</option>
                    <option value="paid">{t('invoices.statusPaid')}</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="btn-accent flex-1">
                    {editingId ? t('invoices.update') : t('invoices.createButton')}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
          </Modal>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card">
            <p className="text-gray-600 text-sm">{t('invoices.statTotal')}</p>
            <p className="text-2xl font-bold">€{invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">{t('invoices.statPending')}</p>
            <p className="text-2xl font-bold text-yellow-600">
              €{invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">{t('invoices.statPaid')}</p>
            <p className="text-2xl font-bold text-green-600">
              €{invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Cobranzas */}
        {(overdueSummary.mild + overdueSummary.warning + overdueSummary.severe) > 0 && (
          <div className="card mb-6 border-l-4 border-red-400">
            <p className="text-gray-600 text-sm mb-2">{t('invoices.overdueTitle')}</p>
            <div className="flex gap-3 flex-wrap">
              {overdueSummary.mild > 0 && (
                <span className="badge badge-pending">{t('invoices.overdueMild', { count: String(overdueSummary.mild) })}</span>
              )}
              {overdueSummary.warning > 0 && (
                <span className="badge badge-warning">{t('invoices.overdueWarning', { count: String(overdueSummary.warning) })}</span>
              )}
              {overdueSummary.severe > 0 && (
                <span className="badge badge-error">{t('invoices.overdueSevere', { count: String(overdueSummary.severe) })}</span>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-x-auto">
          {filteredInvoices.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3 text-left">{t('invoices.colNumber')}</th>
                  <th className="px-4 py-3 text-left">{t('invoices.colClient')}</th>
                  <th className="px-4 py-3 text-left">{t('invoices.colAmount')}</th>
                  <th className="px-4 py-3 text-left">{t('invoices.colStatus')}</th>
                  <th className="px-4 py-3 text-left">{t('invoices.colDueDate')}</th>
                  <th className="px-4 py-3 text-center">{t('invoices.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="table-row">
                    <td className="px-4 py-3 font-mono font-bold">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-sm">{invoice.clients?.name || '-'}</td>
                    <td className="px-4 py-3 font-semibold">€{invoice.amount?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getStatusBadge(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {invoice.due_date
                        ? new Date(invoice.due_date).toLocaleDateString(toBCP47(locale))
                        : '-'}
                      <OverdueBadge dueDate={invoice.due_date} status={invoice.status} />
                    </td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="text-accent hover:text-primary"
                        title={t('invoices.editTooltip')}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => generatePDF(invoice)}
                        className="text-accent hover:text-primary"
                        title={t('invoices.downloadTooltip')}
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => handleSendEmail(invoice)}
                        disabled={sendingEmailId !== null}
                        className="text-accent hover:text-primary disabled:opacity-40"
                        title={t('invoices.emailTooltip')}
                      >
                        <Mail size={18} />
                      </button>
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => window.open(`/pay/${invoice.id}`, '_blank', 'noopener,noreferrer')}
                          className="text-accent hover:text-primary"
                          title={t('invoices.payLinkTooltip')}
                        >
                          <CreditCard size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(invoice.id)}
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
              <FileText className="mx-auto mb-4 text-gray-300" size={48} />
              <p className="text-gray-600 mb-4">{t('invoices.empty')}</p>
              <button
                onClick={() => {
                  resetForm()
                  setShowForm(true)
                }}
                className="btn-accent"
              >
                {t('invoices.createFirst')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
