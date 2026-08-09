export interface Coordinates {
  latitude: number
  longitude: number
}

// Nominatim (OpenStreetMap) es gratuito y no requiere API key, pero exige un
// User-Agent identificable y como mucho 1 petición/segundo por cliente.
// Ver política de uso: https://operations.osmfoundation.org/policies/nominatim/
// Para volúmenes altos, sustituir por un proveedor de pago (Google/Mapbox).
const USER_AGENT = 'ClientFlow-CRM/1.0 (contacto: soporte@clientflow.app)'

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', address)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) return null

  const results: Array<{ lat: string; lon: string }> = await res.json()
  const first = results[0]
  if (!first) return null

  return { latitude: parseFloat(first.lat), longitude: parseFloat(first.lon) }
}
