import Link from 'next/link'

export const metadata = {
  title: 'Términos de servicio — ClientFlow',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-accent hover:underline text-sm">
          ← Volver a ClientFlow
        </Link>

        <h1 className="text-3xl font-bold text-primary mt-4 mb-2">Términos de servicio</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: agosto de 2026</p>

        <div className="card mb-8 border-accent">
          <p className="text-sm">
            <strong>ClientFlow está en fase beta.</strong> Este documento es una versión
            provisional, redactada para cubrir el periodo de pruebas con un número reducido de
            negocios. Puede cambiar sin aviso previo mientras dure la beta, y se sustituirá por
            una versión revisada antes de cualquier lanzamiento público o comercial.
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-primary mb-2">1. Quién ofrece el servicio</h2>
            <p>
              ClientFlow es un servicio operado a título personal por David Iglesias
              (contacto: david.iglesiaslopes62@gmail.com), sin constitución de sociedad
              mercantil por el momento. Al registrarte, aceptas estos términos frente a esa
              persona física, no frente a una empresa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">2. Qué es ClientFlow</h2>
            <p>
              ClientFlow es una herramienta de gestión (CRM y facturación) pensada para negocios
              de servicios de campo (jardinería, fontanería, electricidad, limpieza, etc.):
              gestión de clientes, trabajos, facturas, calendario, rutas y recordatorios
              automáticos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">3. Tu cuenta</h2>
            <p>
              Eres responsable de mantener la confidencialidad de tu contraseña y de toda la
              actividad que ocurra desde tu cuenta. Debes proporcionar datos de contacto
              correctos para poder recibir avisos importantes sobre el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">4. Datos de tus propios clientes</h2>
            <p>
              Si introduces en ClientFlow datos de tus clientes (nombre, teléfono, email,
              dirección), tú eres el responsable de ese tratamiento frente a ellos: debes tener
              una base legítima para conservar y usar esos datos (por ejemplo, la relación
              comercial existente) e informarles según corresponda. ClientFlow actúa como
              encargado técnico del tratamiento, almacenando esos datos en tu nombre.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">5. Pagos y facturación</h2>
            <p>
              El cobro de las facturas que emites a tus clientes se procesa a través de Stripe.
              ClientFlow no interviene en el flujo del dinero ni retiene comisión sobre esos
              cobros durante la fase beta. Durante la beta, el servicio de ClientFlow en sí es
              gratuito; no existe todavía una suscripción de pago propia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">6. Disponibilidad del servicio</h2>
            <p>
              Al ser una fase beta, el servicio puede sufrir interrupciones, cambios de
              funcionalidad o pérdida de datos no intencionada. No se ofrece ningún compromiso
              de nivel de servicio (SLA). Se recomienda no depender de ClientFlow como única
              copia de la información crítica del negocio durante esta fase.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">7. Uso aceptable</h2>
            <p>
              No está permitido usar ClientFlow para actividades ilegales, para enviar
              comunicaciones no solicitadas (spam) a través de las funciones de recordatorios, o
              para intentar acceder a datos de otros negocios distintos del tuyo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">8. Cancelación</h2>
            <p>
              Puedes dejar de usar ClientFlow cuando quieras. Si quieres que tus datos y los de
              tus clientes se eliminen de la base de datos, escribe a
              david.iglesiaslopes62@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">9. Limitación de responsabilidad</h2>
            <p>
              Dado el carácter beta y gratuito del servicio, este se ofrece "tal cual", sin
              garantías de ningún tipo. No se asume responsabilidad por pérdidas económicas
              derivadas del uso o la interrupción del servicio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">10. Ley aplicable</h2>
            <p>Estos términos se rigen por la legislación española.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">11. Contacto</h2>
            <p>
              Cualquier duda sobre estos términos: david.iglesiaslopes62@gmail.com. Ver también
              la <Link href="/privacy" className="text-accent hover:underline">política de privacidad</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
