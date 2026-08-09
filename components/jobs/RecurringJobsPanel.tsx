'use client'

import { useEffect, useState, type FormEvent } from 'react'
import {
  getRecurringJobs,
  createRecurringJob,
  setRecurringJobActive,
  deleteRecurringJob,
} from '@/lib/api'
import { Repeat, Trash2, Pause, Play, Plus, X } from 'lucide-react'
import type { RecurringJobWithClient, RecurrenceFrequency } from '@/types/recurringJob'

interface Client {
  id: string
  name: string
}

interface RecurringJobsPanelProps {
  clients: Client[]
}

const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
}

const EMPTY_FORM = {
  client_id: '',
  title: '',
  frequency: 'weekly' as RecurrenceFrequency,
  next_run_date: '',
  labor_cost: '',
  materials_cost: '0',
  total_amount: '',
}

export default function RecurringJobsPanel({ clients }: RecurringJobsPanelProps) {
  const [items, setItems] = useState<RecurringJobWithClient[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data } = await getRecurringJobs()
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await createRecurringJob({
      ...form,
      labor_cost: parseFloat(form.labor_cost) || 0,
      materials_cost: parseFloat(form.materials_cost) || 0,
      total_amount: parseFloat(form.total_amount) || 0,
    })
    setForm(EMPTY_FORM)
    setShowForm(false)
    load()
  }

  const handleToggle = async (id: string, active: boolean) => {
    await setRecurringJobActive(id, !active)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este trabajo recurrente?')) return
    await deleteRecurringJob(id)
    load()
  }

  if (loading) return null

  return (
    <div className="card mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <Repeat size={20} /> Trabajos recurrentes
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-secondary flex items-center gap-2 text-sm">
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancelar' : 'Nuevo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 mb-6 pb-6 border-b">
          <select
            value={form.client_id}
            onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            className="input-field"
            required
          >
            <option value="">Cliente</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Título"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-field"
            required
          />
          <select
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value as RecurrenceFrequency })}
            className="input-field"
          >
            <option value="weekly">Semanal</option>
            <option value="biweekly">Quincenal</option>
            <option value="monthly">Mensual</option>
          </select>
          <input
            type="date"
            value={form.next_run_date}
            onChange={(e) => setForm({ ...form, next_run_date: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Mano de obra"
            value={form.labor_cost}
            onChange={(e) => setForm({ ...form, labor_cost: e.target.value })}
            className="input-field"
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Materiales"
            value={form.materials_cost}
            onChange={(e) => setForm({ ...form, materials_cost: e.target.value })}
            className="input-field"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Precio final"
            value={form.total_amount}
            onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
            className="input-field"
            required
          />
          <button type="submit" className="btn-accent">Crear</button>
        </form>
      )}

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay trabajos recurrentes configurados.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">
                  {item.client_name} · {FREQUENCY_LABELS[item.frequency]} · próximo:{' '}
                  {new Date(item.next_run_date).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${item.active ? 'badge-success' : 'badge-pending'}`}>
                  {item.active ? 'Activo' : 'Pausado'}
                </span>
                <button onClick={() => handleToggle(item.id, item.active)} className="text-accent hover:text-primary">
                  {item.active ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
