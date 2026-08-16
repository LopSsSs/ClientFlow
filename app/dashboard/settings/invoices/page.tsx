'use client'

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { getInvoiceSettings, updateInvoiceSettings, uploadInvoiceLogo } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'
import { useNotification } from '@/store/notificationStore'
import { COUNTRY_NAMES, DEFAULT_COUNTRY, getTaxData } from '@/lib/constants/taxByCountry'
import type { BusinessSettings } from '@/lib/db/businessSettings'

interface FormState {
  logo_url: string
  color_primary: string
  color_secondary: string
  company_name: string
  company_address: string
  company_phone: string
  company_email: string
  company_cif: string
  payment_paypal_email: string
  payment_bizum_phone: string
  payment_transfer_enabled: boolean
  payment_transfer_iban: string
  invoice_terms_text: string
  country: string
}

const EMPTY_FORM: FormState = {
  logo_url: '',
  color_primary: '#FF6B35',
  color_secondary: '#1f2937',
  company_name: '',
  company_address: '',
  company_phone: '',
  company_email: '',
  company_cif: '',
  payment_paypal_email: '',
  payment_bizum_phone: '',
  payment_transfer_enabled: false,
  payment_transfer_iban: '',
  invoice_terms_text: '',
  country: DEFAULT_COUNTRY,
}

export default function InvoiceSettingsPage() {
  const { t } = useTranslation()
  const { notifySuccess, notifyError } = useNotification()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    getInvoiceSettings()
      .then((data: BusinessSettings) => {
        setForm({
          logo_url: data.logo_url || '',
          color_primary: data.color_primary || '#FF6B35',
          color_secondary: data.color_secondary || '#1f2937',
          company_name: data.company_name || '',
          company_address: data.company_address || '',
          company_phone: data.company_phone || '',
          company_email: data.company_email || '',
          company_cif: data.company_cif || '',
          payment_paypal_email: data.payment_paypal_email || '',
          payment_bizum_phone: data.payment_bizum_phone || '',
          payment_transfer_enabled: Boolean(data.payment_transfer_enabled),
          payment_transfer_iban: data.payment_transfer_iban || '',
          invoice_terms_text: data.invoice_terms_text || '',
          country: data.country || DEFAULT_COUNTRY,
        })
      })
      .catch(() => notifyError(t('invoiceSettings.loadError')))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const { url } = await uploadInvoiceLogo(file)
      setForm((prev) => ({ ...prev, logo_url: url }))
    } catch (error) {
      notifyError(error instanceof Error ? error.message : t('invoiceSettings.logoUploadError'))
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateInvoiceSettings(form)
      setForm((prev) => ({ ...prev, country: updated.country }))
      notifySuccess(t('settings.saved'))
    } catch (error) {
      notifyError(error instanceof Error ? error.message : t('invoiceSettings.saveError'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{t('common.loading')}</div>
  }

  const taxData = getTaxData(form.country)

  return (
    <div className="min-h-screen bg-light">
      <Navbar />

      <div className="max-w-2xl mx-auto p-6">
        <Link href="/dashboard/settings" className="text-sm text-gray-500 hover:underline">
          {t('invoiceSettings.backToSettings')}
        </Link>
        <h1 className="text-4xl font-bold text-primary mt-2 mb-8">{t('invoiceSettings.title')}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card space-y-4">
            <h2 className="text-xl font-bold text-primary">{t('invoiceSettings.visualSection')}</h2>

            <div>
              <label className="block text-sm font-medium mb-2">{t('invoiceSettings.logo')}</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">{t('invoiceSettings.logoHint')}</p>
              {form.logo_url && <img src={form.logo_url} alt="Logo" className="mt-2 h-16 object-contain" />}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('invoiceSettings.colorPrimary')}</label>
                <input
                  type="color"
                  value={form.color_primary}
                  onChange={(e) => setForm({ ...form, color_primary: e.target.value })}
                  className="input-field h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('invoiceSettings.colorSecondary')}</label>
                <input
                  type="color"
                  value={form.color_secondary}
                  onChange={(e) => setForm({ ...form, color_secondary: e.target.value })}
                  className="input-field h-10"
                />
              </div>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="text-xl font-bold text-primary">{t('invoiceSettings.companySection')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder={t('invoiceSettings.companyName')}
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder={t('invoiceSettings.companyPhone')}
                value={form.company_phone}
                onChange={(e) => setForm({ ...form, company_phone: e.target.value })}
                className="input-field"
              />
              <input
                type="email"
                placeholder={t('invoiceSettings.companyEmail')}
                value={form.company_email}
                onChange={(e) => setForm({ ...form, company_email: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder={t('invoiceSettings.companyCif')}
                value={form.company_cif}
                onChange={(e) => setForm({ ...form, company_cif: e.target.value })}
                className="input-field"
              />
            </div>
            <textarea
              placeholder={t('invoiceSettings.companyAddress')}
              value={form.company_address}
              onChange={(e) => setForm({ ...form, company_address: e.target.value })}
              className="input-field"
              rows={2}
            />
          </div>

          <div className="card space-y-4">
            <h2 className="text-xl font-bold text-primary">{t('invoiceSettings.paymentSection')}</h2>
            <input
              type="email"
              placeholder={t('invoiceSettings.paypalEmail')}
              value={form.payment_paypal_email}
              onChange={(e) => setForm({ ...form, payment_paypal_email: e.target.value })}
              className="input-field"
            />
            <input
              type="tel"
              placeholder={t('invoiceSettings.bizumPhone')}
              value={form.payment_bizum_phone}
              onChange={(e) => setForm({ ...form, payment_bizum_phone: e.target.value })}
              className="input-field"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.payment_transfer_enabled}
                onChange={(e) => setForm({ ...form, payment_transfer_enabled: e.target.checked })}
                className="w-4 h-4"
              />
              {t('invoiceSettings.transferEnabled')}
            </label>
            {form.payment_transfer_enabled && (
              <input
                type="text"
                placeholder={t('invoiceSettings.transferIban')}
                value={form.payment_transfer_iban}
                onChange={(e) => setForm({ ...form, payment_transfer_iban: e.target.value })}
                className="input-field"
              />
            )}
          </div>

          <div className="card space-y-4">
            <h2 className="text-xl font-bold text-primary">{t('invoiceSettings.countrySection')}</h2>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="input-field"
            >
              {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
            <p className="text-sm text-gray-600">
              {t('invoiceSettings.taxInfo', {
                name: taxData.name,
                rate: (taxData.rate * 100).toFixed(2),
                currency: taxData.currency,
              })}
            </p>
          </div>

          <div className="card space-y-4">
            <h2 className="text-xl font-bold text-primary">{t('invoiceSettings.termsSection')}</h2>
            <textarea
              placeholder={t('invoiceSettings.termsPlaceholder')}
              value={form.invoice_terms_text}
              onChange={(e) => setForm({ ...form, invoice_terms_text: e.target.value })}
              className="input-field"
              rows={4}
            />
          </div>

          <div className="flex items-center gap-4">
            <button type="submit" className="btn-accent" disabled={saving}>
              {t('settings.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
