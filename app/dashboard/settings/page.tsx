'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import { updateBusiness } from '@/lib/api'
import { isValidPhone } from '@/utils/phone'
import { useTranslation } from '@/hooks/useTranslation'
import MessageTemplatesForm from '@/components/settings/MessageTemplatesForm'

interface SettingsFormState {
  name: string
  phone: string
  whatsapp_number: string
  currency: string
  default_hourly_rate: string
}

const EMPTY_FORM: SettingsFormState = {
  name: '',
  phone: '',
  whatsapp_number: '',
  currency: 'EUR',
  default_hourly_rate: '',
}

export default function SettingsPage() {
  const { business, loading, setBusiness } = useAuth()
  const { t } = useTranslation()
  const [form, setForm] = useState<SettingsFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!business) return
    setForm({
      name: business.name || '',
      phone: business.phone || '',
      whatsapp_number: business.whatsapp_number || '',
      currency: business.currency || 'EUR',
      default_hourly_rate: business.default_hourly_rate?.toString() ?? '',
    })
  }, [business])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (form.phone && !isValidPhone(form.phone)) {
      setError('El teléfono no tiene un formato válido')
      return
    }
    if (form.whatsapp_number && !isValidPhone(form.whatsapp_number)) {
      setError('El número de WhatsApp no tiene un formato válido')
      return
    }

    setSaving(true)
    try {
      const updated = await updateBusiness({
        name: form.name,
        phone: form.phone || null,
        whatsapp_number: form.whatsapp_number || null,
        currency: form.currency,
        default_hourly_rate: form.default_hourly_rate === '' ? null : Number(form.default_hourly_rate),
      })
      setBusiness(updated)
      setSavedAt(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !business) {
    return <div className="flex justify-center items-center h-screen">{t('common.loading')}</div>
  }

  return (
    <div className="min-h-screen bg-light">
      <Navbar />

      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-primary mb-8">{t('settings.title')}</h1>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('settings.companyName')}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('settings.phone')}</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('settings.whatsapp')}</label>
              <input
                type="text"
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('settings.currency')}</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="input-field"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="CHF">CHF</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('settings.hourlyRate')}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.default_hourly_rate}
              onChange={(e) => setForm({ ...form, default_hourly_rate: e.target.value })}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">{t('settings.hourlyRateHint')}</p>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex items-center gap-4 pt-2">
            <button type="submit" className="btn-accent" disabled={saving}>
              {t('settings.save')}
            </button>
            {savedAt && <span className="text-sm text-green-700">{t('settings.saved')}</span>}
          </div>
        </form>

        <div className="mt-6">
          <MessageTemplatesForm />
        </div>

        <div className="mt-6">
          <Link href="/dashboard/settings/invoices" className="card block hover:bg-gray-50 transition-colors">
            <span className="font-medium text-primary">{t('settings.invoiceLink')}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
