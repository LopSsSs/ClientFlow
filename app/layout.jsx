import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { LayoutWrapper } from './LayoutWrapper'

export const metadata = {
  title: 'ClientFlow - CRM para Servicios',
  description: 'Gestiona clientes, trabajos y facturas fácilmente',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-light">
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
