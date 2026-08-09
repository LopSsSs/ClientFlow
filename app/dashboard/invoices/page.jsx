'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import { getInvoices, getJobs, createInvoice, updateInvoice, deleteInvoice } from '@/lib/api'
import { generateInvoicePDF, downloadInvoice } from '@/lib/invoiceGenerator'
import { getOverdueInfo } from '@/utils/collections'
import OverdueBadge from '@/components/OverdueBadge'
import { FileText, Trash2, Plus, X, Download, Edit2, CreditCard } from 'lucide-react'

export default function InvoicesPage() {
  const { business, user, loading } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [jobs, setJobs] = useState([])
  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
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
      alert('Error al guardar factura: ' + error.message)
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
    setEditingId(null)
    setShowForm(false)
  }

  const handleDelete = async (invoiceId) => {
    if (confirm('¿Estás seguro que quieres eliminar esta factura?')) {
      try {
        await deleteInvoice(invoiceId)
        loadInvoices()
      } catch (error) {
        alert('Error al eliminar factura: ' + error.message)
      }
    }
  }

  const generatePDF = (invoice) => {
    const jobData = jobs.find(j => j.id === invoice.job_id)
    
    const invoiceData = {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      amount: invoice.amount,
      tax: invoice.tax,
      client_name: invoice.clients?.name || 'Cliente',
      client_email: invoice.clients?.email || '',
      client_phone: invoice.clients?.phone || '',
      client_address: invoice.clients?.address || '',
      description: jobData?.title || 'Servicio prestado',
    }

    const doc = generateInvoicePDF(invoiceData, business)
    downloadInvoice(doc, invoice.invoice_number)
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

  const overdueSummary = invoices.reduce(
    (acc, inv) => {
      const { bucket } = getOverdueInfo(inv.due_date, inv.status)
      if (bucket !== 'none') acc[bucket] += 1
      return acc
    },
    { mild: 0, warning: 0, severe: 0 }
  )

  if (loading || loadingInvoices) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-light">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Facturas</h1>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="btn-accent flex items-center gap-2"
          >
            <Plus size={20} /> Crear Factura
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { label: 'Todas', value: 'all' },
            { label: 'Pendientes', value: 'pending' },
            { label: 'Enviadas', value: 'sent' },
            { label: 'Pagadas', value: 'paid' },
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
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">
                  {editingId ? 'Editar Factura' : 'Nueva Factura'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-primary">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Trabajo (Opcional)</label>
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
                    <option value="">Selecciona un trabajo</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} - €{job.total_amount}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Monto *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">IVA (Impuesto)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="sent">Enviada</option>
                    <option value="paid">Pagada</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="btn-accent flex-1">
                    {editingId ? 'Actualizar Factura' : 'Crear Factura'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card">
            <p className="text-gray-600 text-sm">Totales</p>
            <p className="text-2xl font-bold">€{invoices.reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}</p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">
              €{invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="card">
            <p className="text-gray-600 text-sm">Pagadas</p>
            <p className="text-2xl font-bold text-green-600">
              €{invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Cobranzas */}
        {(overdueSummary.mild + overdueSummary.warning + overdueSummary.severe) > 0 && (
          <div className="card mb-6 border-l-4 border-red-400">
            <p className="text-gray-600 text-sm mb-2">Cobros pendientes por antigüedad</p>
            <div className="flex gap-3 flex-wrap">
              {overdueSummary.mild > 0 && (
                <span className="badge badge-pending">{overdueSummary.mild} entre 7-29 días</span>
              )}
              {overdueSummary.warning > 0 && (
                <span className="badge badge-warning">{overdueSummary.warning} entre 30-59 días</span>
              )}
              {overdueSummary.severe > 0 && (
                <span className="badge badge-error">{overdueSummary.severe} de 60+ días</span>
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
                  <th className="px-4 py-3 text-left">Número</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Monto</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Vencimiento</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
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
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {invoice.due_date
                        ? new Date(invoice.due_date).toLocaleDateString('es-ES')
                        : '-'}
                      <OverdueBadge dueDate={invoice.due_date} status={invoice.status} />
                    </td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="text-accent hover:text-primary"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => generatePDF(invoice)}
                        className="text-accent hover:text-primary"
                        title="Descargar PDF"
                      >
                        <Download size={18} />
                      </button>
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => window.open(`/pay/${invoice.id}`, '_blank')}
                          className="text-accent hover:text-primary"
                          title="Abrir enlace de pago"
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
              <p className="text-gray-600 mb-4">No hay facturas aún</p>
              <button
                onClick={() => {
                  resetForm()
                  setShowForm(true)
                }}
                className="btn-accent"
              >
                Crear primera factura
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
