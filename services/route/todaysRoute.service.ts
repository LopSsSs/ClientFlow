import { getTodaysJobs, type RouteJob } from '@/lib/db/route'
import { updateClientCoordinates } from '@/lib/neon'
import { geocodeAddress } from '@/services/geocoding/nominatim'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildFullAddress(job: RouteJob): string | null {
  if (!job.client_address) return null
  return [job.client_address, job.client_city, job.client_postal_code].filter(Boolean).join(', ')
}

// Geocodifica en el momento los clientes de hoy que aún no tienen lat/lng,
// respetando el límite de Nominatim (~1 petición/segundo) con un pequeño
// espaciado secuencial. El resultado se guarda para no repetir la consulta.
export async function getTodaysRoute(businessId: string): Promise<RouteJob[]> {
  const jobs = await getTodaysJobs(businessId)

  const pendingClientIds = new Set(
    jobs.filter((j) => j.client_latitude === null && buildFullAddress(j)).map((j) => j.client_id)
  )

  const resolvedCoords = new Map<string, { latitude: number; longitude: number }>()

  for (const clientId of pendingClientIds) {
    const job = jobs.find((j) => j.client_id === clientId)!
    const address = buildFullAddress(job)!

    const coords = await geocodeAddress(address)
    if (coords) {
      await updateClientCoordinates(clientId, businessId, coords.latitude, coords.longitude)
      resolvedCoords.set(clientId, coords)
    }
    await sleep(1100)
  }

  return jobs.map((job) => {
    const resolved = resolvedCoords.get(job.client_id)
    return resolved ? { ...job, client_latitude: resolved.latitude, client_longitude: resolved.longitude } : job
  })
}
