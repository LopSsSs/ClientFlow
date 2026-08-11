'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle } from 'lucide-react'

interface InvoiceSummary {
  id: string
  invoice_number: string
  amount: number
  tax: number
  status: string
  business_name: string
  client_name: string | null
  currency: string
}

const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£', CHF: 'CHF ' }

function formatMoney(value: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `
  return `${symbol}${value.toFixed(2)}`
}

export default function PayInvoicePage() {
  const params = useParams<{ invoiceId: string }>()
  const searchParams = useSearchParams()
  const checkoutResult = searchParams.get('status')

  const [invoice, setInvoice] = useState<InvoiceSummary | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

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

  const handlePay = async () => {
    setPaying(true)
    setPayError(null)
    try {
      const res = await fetch(`/api/pay/${params.invoiceId}/checkout`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error === 'not_found' ? 'Factura no encontrada' : 'No se pudo iniciar el pago')
      window.location.href = data.url
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Error')
      setPaying(false)
    }
  }

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
          <>
            {checkoutResult === 'cancelled' && (
              <p className="text-sm text-orange-600 mb-3">Pago cancelado. Puedes intentarlo de nuevo.</p>
            )}
            <button onClick={handlePay} disabled={paying} className="btn-accent w-full">
              {paying ? 'Redirigiendo...' : 'Pincha aquí para pagar'}
            </button>
            {payError && <p className="text-red-600 text-sm mt-3 text-center">{payError}</p>}
          </>
        )}
      </div>
    </div>
  )
}
