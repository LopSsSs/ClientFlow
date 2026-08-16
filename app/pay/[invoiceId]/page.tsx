'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle2, XCircle } from 'lucide-react'
import { buildPaypalPaymentUrl } from '@/lib/paypal'

interface InvoiceSummary {
  id: string
  invoice_number: string
  amount: number
  tax: number
  status: string
  business_name: string
  client_name: string | null
  currency: string
  payment_paypal_email: string | null
  payment_bizum_phone: string | null
  payment_transfer_enabled: boolean
  payment_transfer_iban: string | null
}

const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF ' }

function formatMoney(value: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `
  return `${symbol}${value.toFixed(2)}`
}

export default function PayInvoicePage() {
  const params = useParams<{ invoiceId: string }>()

  const [invoice, setInvoice] = useState<InvoiceSummary | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/pay/${params.invoiceId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Factura no encontrada')
        return res.json() as Promise<InvoiceSummary>
      })
      .then(setInvoice)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false))
  }, [params.invoiceId])

  if (loading) {
    return <div className="min-h-screen bg-light flex items-center justify-center">Cargando...</div>
  }

  if (loadError || !invoice) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center p-6">
        <div className="card max-w-md text-center">
          <XCircle className="mx-auto mb-4 text-red-500" size={40} />
          <p className="text-gray-700">{loadError || 'Factura no encontrada'}</p>
        </div>
      </div>
    )
  }

  const total = invoice.amount + invoice.tax
  const isPaid = invoice.status === 'paid'
  const hasTransfer = invoice.payment_transfer_enabled && invoice.payment_transfer_iban
  const hasAnyPaymentMethod = invoice.payment_paypal_email || invoice.payment_bizum_phone || hasTransfer

  return (
    <div className="min-h-screen bg-light flex items-center justify-center p-6">
      <div className="card max-w-md w-full">
        <p className="text-sm text-gray-500 mb-1">{invoice.business_name}</p>
        <h1 className="text-2xl font-bold text-primary mb-4">Factura {invoice.invoice_number}</h1>

        {invoice.client_name && (
          <p className="text-sm text-gray-600 mb-4">Cliente: {invoice.client_name}</p>
        )}

        <div className="bg-light rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">Total a pagar</p>
          <p className="text-3xl font-bold text-primary">{formatMoney(total, invoice.currency)}</p>
        </div>

        {isPaid ? (
          <div className="flex items-center gap-2 text-green-700 justify-center">
            <CheckCircle2 size={20} />
            <span className="font-medium">Esta factura ya está pagada</span>
          </div>
        ) : (
          <div className="space-y-3">
            {invoice.payment_paypal_email && (
              <a
                href={buildPaypalPaymentUrl(
                  invoice.payment_paypal_email,
                  total,
                  invoice.currency,
                  `Factura ${invoice.invoice_number} - ${invoice.business_name}`
                )}
                className="btn-accent w-full block text-center"
              >
                Pagar con PayPal
              </a>
            )}

            {invoice.payment_bizum_phone && (
              <div className="bg-light rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600">Bizum</p>
                <p className="font-bold text-primary">{invoice.payment_bizum_phone}</p>
              </div>
            )}

            {hasTransfer && (
              <div className="bg-light rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600">Transferencia bancaria</p>
                <p className="font-bold text-primary break-all">{invoice.payment_transfer_iban}</p>
              </div>
            )}

            {!hasAnyPaymentMethod && (
              <p className="text-sm text-gray-500 text-center">
                Contacta con {invoice.business_name} para conocer las formas de pago disponibles.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
