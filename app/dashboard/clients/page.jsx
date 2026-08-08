'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import { getClients, createClient, updateClient, deleteClient } from '@/lib/api'
import { Edit2, Trash2, Plus, Search, X } from 'lucide-react'

export default function ClientsPage() {
  const { business, loading } = useAuth()
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp_number: '',
    email: '',
    address: '',
    city: '',
    postal_code: '',
    service_type: '',
  })

  useEffect(() => {
    if (business?.id) {
      loadClients()
    }
  }, [business])

  const loadClients = async () => {
    try {
      const { data } = await getClients(business.id)
      setClients(data || [])
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoadingClients(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateClient(editingId, formData)
      } else {
        await createClient(business.id, formData)
      }
      setFormData({
        name: '',
        phone: '',
        whatsapp_number: '',
        email: '',
        address: '',
        city: '',
        postal_code: '',
        service_type: '',
      })
      setEditingId(null)
      setShowForm(false)
      loadClients()
    } catch (error) {
      alert('Error al guardar cliente: ' + error.message)
    }
  }

  const handleEdit = (client) => {
    setFormData(client)
    setEditingId(client.id)
    setShowForm(true)
  }

  const handleDelete = async (clientId) => {
    if (confirm('¿Estás seguro que quieres eliminar este cliente?')) {
      try {
        await deleteClient(clientId)
        loadClients()
      } catch (error) {
        alert('Error al eliminar cliente: ' + error.message)
      }
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm)
  )

  if (loading || loadingClients) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-light">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Clientes</h1>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingId(null)
              setFormData({
                name: '',
                phone: '',
                whatsapp_number: '',
                email: '',
                address: '',
                city: '',
                postal_code: '',
                service_type: '',
              })
            }}
            className="btn-accent flex items-center gap-2"
          >
            <Plus size={20} /> Agregar Cliente
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">
                  {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                  }}
                  className="text-gray-400 hover:text-primary"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="tel"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  className="input-field"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Dirección"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Ciudad"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="CP"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="input-field"
                  />
                </div>
                <select
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  className="input-field"
                >
                  <option value="">Tipo de servicio</option>
                  <option value="jardinería">Jardinería</option>
                  <option value="fontanería">Fontanería</option>
                  <option value="electricidad">Electricidad</option>
                  <option value="limpieza">Limpieza</option>
                  <option value="construcción">Construcción</option>
                  <option value="otros">Otros</option>
                </select>

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="btn-accent flex-1">
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-x-auto">
          {filteredClients.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Teléfono</th>
                  <th className="px-4 py-3 text-left">Ciudad</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="table-row">
                    <td className="px-4 py-3 font-semibold">{client.name}</td>
                    <td className="px-4 py-3 text-sm">{client.email || '-'}</td>
                    <td className="px-4 py-3 text-sm">{client.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm">{client.city || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {client.service_type ? (
                        <span className="badge badge-success">{client.service_type}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-accent hover:text-primary mr-3"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
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
              <p className="text-gray-600 mb-4">No hay clientes aún</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-accent"
              >
                Crear primer cliente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
