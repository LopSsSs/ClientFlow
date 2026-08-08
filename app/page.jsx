'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { redirect } from 'next/navigation'
import { CheckCircle, Users, Briefcase, FileText } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>
  }

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="bg-primary text-light min-h-screen">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="bg-accent text-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Briefcase size={32} />
        </div>
        <h1 className="text-5xl font-bold mb-4">ClientFlow</h1>
        <p className="text-xl opacity-90 mb-8">
          Gestiona clientes, trabajos y facturas. Todo en un lugar.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup" className="btn-accent">
            Comenzar Ahora
          </Link>
          <Link href="/auth/login" className="btn-secondary">
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">¿Por qué ClientFlow?</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur-sm">
            <Users className="text-accent mb-4" size={40} />
            <h3 className="text-2xl font-bold mb-4">Gestión de Clientes</h3>
            <p className="opacity-80">
              Mantén un registro completo de todos tus clientes. Teléfono, email, dirección, notas personalizadas.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur-sm">
            <Briefcase className="text-accent mb-4" size={40} />
            <h3 className="text-2xl font-bold mb-4">Control de Trabajos</h3>
            <p className="opacity-80">
              Crea, asigna y controla el estado de tus trabajos. De pending a completed automáticamente.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur-sm">
            <FileText className="text-accent mb-4" size={40} />
            <h3 className="text-2xl font-bold mb-4">Facturas Automáticas</h3>
            <p className="opacity-80">
              Genera facturas en PDF automáticamente y envíalas por email a tus clientes.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Planes</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Starter',
              price: '19,99€',
              features: ['50 clientes', 'Ilimitados trabajos', 'Facturas básicas', 'Email support'],
            },
            {
              name: 'Professional',
              price: '49,99€',
              features: ['200 clientes', 'Ilimitados trabajos', 'Reportes avanzados', 'Prioridad 24/7'],
              highlight: true,
            },
            {
              name: 'Enterprise',
              price: '99,99€',
              features: ['Ilimitados clientes', 'Integraciones custom', 'Dedicado', 'SLA garantizado'],
            },
          ].map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-8 ${
                plan.highlight
                  ? 'bg-accent text-primary ring-4 ring-accent ring-offset-2'
                  : 'bg-white bg-opacity-10 backdrop-blur-sm'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className={`text-4xl font-bold mb-6 ${plan.highlight ? '' : 'text-accent'}`}>
                {plan.price}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-center gap-2">
                    <CheckCircle size={20} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={plan.highlight ? 'btn-primary w-full' : 'btn-accent w-full'}>
                Elegir Plan
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">¿Listo para empezar?</h2>
        <p className="text-xl opacity-80 mb-8">
          Sin tarjeta de crédito. Sin compromiso. Gratis durante 14 días.
        </p>
        <Link href="/auth/signup" className="btn-accent text-lg px-8 py-3">
          Crear cuenta ahora
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-accent/20 py-8 text-center opacity-75">
        <p>ClientFlow © 2024. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
