'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import { getJobs, getClients, createJob, updateJob, deleteJob } from '@/lib/api'
import { Edit2, Trash2, Plus, X } from 'lucide-react'

export default function JobsPage() {
  const { business, loading } = useAuth()
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
      const totalAmount = (parseFloat(formData.labor_cost) || 0) + (parseFloat(formData.materials_cost) || 0)
      
      const jobData = {
        ...formData,
        duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : 0,
        materials_cost: parseFloat(formData.materials_cost) || 0,
        labor_cost: parseFloat(formData.labor_cost) || 0,
        total_amount: totalAmount,
      }

      if (editingId) {
        await updateJob(editingId, jobData)
      } else {
        await createJob(business.id, jobData)
      }
      resetForm()
      loadJobs()
    } catch (error) {
      alert('Error al guardar trabajo: ' + error.message)
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
      notes: job.notes || '',
    })
    setEditingId(job.id)
    setShowForm(true)
  }

  const handleDelete = async (jobId) => {
    if (confirm('¿Estás seguro que quieres eliminar este trabajo?')) {
      try {
        await deleteJob(jobId)
        loadJobs()
      } catch (error) {
        alert('Error al eliminar trabajo: ' + error.message)
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

  if (loading || loadingJobs) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-light">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Trabajos</h1>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="btn-accent flex items-center gap-2"
          >
            <Plus size={20} /> Crear Trabajo
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {[
            { label: 'Todos', value: 'all' },
            { label: 'Pendientes', value: 'pending' },
            { label: 'Completados', value: 'completed' },
            { label: 'Facturados', value: 'invoiced' },
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
                  {editingId ? 'Editar Trabajo' : 'Nuevo Trabajo'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-primary">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cliente *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Título *</label>
                  <input
                    type="text"
                    placeholder="Ej: Poda de plantas"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    placeholder="Detalles del trabajo..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha Programada</label>
                    <input
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha Completado</label>
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
                    <label className="block text-sm font-medium mb-2">Horas</label>
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
                    <label className="block text-sm font-medium mb-2">Estado</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input-field"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="completed">Completado</option>
                      <option value="invoiced">Facturado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Costo de Materiales</label>
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
                    <label className="block text-sm font-medium mb-2">Costo de Mano de Obra *</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.labor_cost}
                      onChange={(e) => setFormData({ ...formData, labor_cost: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notas</label>
                  <textarea
                    placeholder="Notas adicionales..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-field h-16"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="btn-accent flex-1">
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                    Cancelar
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
                  <th className="px-4 py-3 text-left">Título</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Monto</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="table-row">
                    <td className="px-4 py-3 font-semibold">{job.title}</td>
                    <td className="px-4 py-3 text-sm">{job.clients?.name || '-'}</td>
                    <td className="px-4 py-3 font-medium">€{job.total_amount?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getStatusBadge(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {job.scheduled_date
                        ? new Date(job.scheduled_date).toLocaleDateString('es-ES')
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
              <p className="text-gray-600 mb-4">No hay trabajos aún</p>
              <button
                onClick={() => {
                  resetForm()
                  setShowForm(true)
                }}
                className="btn-accent"
              >
                Crear primer trabajo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
