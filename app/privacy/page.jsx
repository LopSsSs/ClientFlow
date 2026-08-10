import Link from 'next/link'

export const metadata = {
  title: 'Política de privacidad — ClientFlow',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-accent hover:underline text-sm">
          ← Volver a ClientFlow
        </Link>

        <h1 className="text-3xl font-bold text-primary mt-4 mb-2">Política de privacidad</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: agosto de 2026</p>

        <div className="card mb-8 border-accent">
          <p className="text-sm">
            <strong>ClientFlow está en fase beta.</strong> Esta política cubre el
            funcionamiento actual del servicio con un número reducido de negocios de prueba.
            Se revisará antes de cualquier lanzamiento a mayor escala.
          </p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-primary mb-2">1. Responsable del tratamiento</h2>
            <p>
              David Iglesias, a título personal, operando ClientFlow como proyecto individual
              (sin sociedad mercantil constituida por el momento). Contacto:
              david.iglesiaslopes62@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">2. Qué datos recogemos</h2>
            <p className="mb-2"><strong>Sobre ti, como usuario registrado:</strong> email, contraseña (cifrada), nombre del negocio, teléfono, WhatsApp, moneda e idioma preferido.</p>
            <p>
              <strong>Sobre los clientes de tu negocio:</strong> los datos que tú introduces en
              la aplicación (nombre, teléfono, email, dirección) para poder gestionar tus
              trabajos y facturas. Nosotros los almacenamos en tu nombre; no los recogemos
              directamente de esas personas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">3. Para qué los usamos</h2>
            <p>
              Para prestar el servicio (gestión de clientes, trabajos, facturas, calendario,
              recordatorios), para comunicarnos contigo sobre tu cuenta, y para procesar los
              cobros de tus facturas a través de Stripe cuando activas esa función.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">4. Base legal</h2>
            <p>
              Ejecución del contrato de uso del servicio (para tus propios datos) e interés
              legítimo en la gestión de tu negocio (para los datos de tus clientes, bajo tu
              responsabilidad como indican los términos de servicio).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">5. Con quién compartimos datos</h2>
            <p className="mb-2">Usamos los siguientes proveedores para operar ClientFlow, que actúan como encargados del tratamiento:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Neon</strong> (base de datos)</li>
              <li><strong>Vercel</strong> (alojamiento de la aplicación)</li>
              <li><strong>Resend</strong> (envío de emails transaccionales)</li>
              <li><strong>Stripe</strong> (procesamiento de pagos de tus facturas)</li>
              <li><strong>Make.com / Meta (WhatsApp Business)</strong> (envío de recordatorios por WhatsApp, cuando esté activo)</li>
            </ul>
            <p className="mt-2">No vendemos ni cedemos datos a terceros con fines publicitarios.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">6. Transferencias internacionales</h2>
            <p>
              Algunos de estos proveedores pueden alojar o procesar datos fuera del Espacio
              Económico Europeo. Todos ellos ofrecen garantías estándar de transferencia
              internacional de datos (cláusulas contractuales tipo u otros mecanismos
              reconocidos por el RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">7. Cuánto tiempo conservamos los datos</h2>
            <p>
              Mientras tu cuenta esté activa. Si la cancelas y solicitas la eliminación de tus
              datos, los borraremos en un plazo razonable, salvo obligación legal de
              conservación (por ejemplo, facturación).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">8. Tus derechos</h2>
            <p>
              Puedes solicitar acceso, rectificación, eliminación, oposición, limitación o
              portabilidad de tus datos escribiendo a david.iglesiaslopes62@gmail.com. Responderemos
              en el plazo legal aplicable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">9. Seguridad</h2>
            <p>
              Las contraseñas se almacenan cifradas, las conexiones usan HTTPS y el acceso a los
              datos de cada negocio está aislado por cuenta. Al ser un servicio en fase beta,
              estas medidas seguirán reforzándose antes de un lanzamiento a mayor escala.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">10. Cambios en esta política</h2>
            <p>
              Podemos actualizar esta política durante la fase beta. Si el cambio es
              significativo, te avisaremos por email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-primary mb-2">11. Contacto</h2>
            <p>
              david.iglesiaslopes62@gmail.com. Ver también los{' '}
              <Link href="/terms" className="text-accent hover:underline">términos de servicio</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
