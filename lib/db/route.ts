import { sql } from '@/lib/neon'

export interface RouteJob {
  id: string
  title: string
  scheduled_date: string
  status: string
  client_id: string
  client_name: string
  client_address: string | null
  client_city: string | null
  client_postal_code: string | null
  client_latitude: number | null
  client_longitude: number | null
}

export async function getTodaysJobs(businessId: string): Promise<RouteJob[]> {
  return sql<RouteJob[]>`
    SELECT j.id, j.title, j.scheduled_date, j.status, c.id AS client_id,
           c.name AS client_name, c.address AS client_address, c.city AS client_city,
           c.postal_code AS client_postal_code, c.latitude AS client_latitude, c.longitude AS client_longitude
    FROM jobs j
    JOIN clients c ON c.id = j.client_id
    WHERE j.business_id = ${businessId}
      AND j.scheduled_date >= CURRENT_DATE
      AND j.scheduled_date < CURRENT_DATE + INTERVAL '1 day'
    ORDER BY j.scheduled_date ASC
  `
}
