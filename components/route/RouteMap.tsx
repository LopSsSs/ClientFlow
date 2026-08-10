'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useTranslation } from '@/hooks/useTranslation'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// El icono por defecto de Leaflet rompe con bundlers (rutas relativas al CSS);
// se reconstruye explícitamente con los assets importados.
const defaultIcon = L.icon({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface RouteStop {
  id: string
  title: string
  clientName: string
  latitude: number
  longitude: number
}

interface RouteMapProps {
  stops: RouteStop[]
}

export default function RouteMap({ stops }: RouteMapProps) {
  const { t } = useTranslation()
  if (stops.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500 text-sm">
        {t('route.noStops')}
      </div>
    )
  }

  const center: [number, number] = [stops[0]!.latitude, stops[0]!.longitude]

  return (
    <MapContainer center={center} zoom={12} style={{ height: 400, width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stops.map((stop, index) => (
        <Marker key={stop.id} position={[stop.latitude, stop.longitude]} icon={defaultIcon}>
          <Popup>
            <strong>{index + 1}. {stop.title}</strong>
            <br />
            {stop.clientName}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
