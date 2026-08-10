import { X } from 'lucide-react'

// Overlay + tarjeta + cabecera con botón de cerrar: repetido antes de forma
// casi idéntica en Clientes, Trabajos y Facturas.
export default function Modal({ title, onClose, maxWidth = 'max-w-md', children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg shadow-xl ${maxWidth} w-full p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-primary">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
