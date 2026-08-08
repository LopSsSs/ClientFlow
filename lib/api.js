// Cliente HTTP del navegador hacia las rutas /api del propio servidor.
// Mantiene los nombres y formas de retorno que las páginas ya usaban
// (por ejemplo, listas envueltas en { data } y el cliente anidado en `clients`).

async function request(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json.error || 'Error de servidor')
  }
  return json
}

// Las filas de jobs/invoices llegan con client_name, client_phone... planos;
// las páginas esperan row.clients.name como devolvía Supabase.
function nestClient(row) {
  return {
    ...row,
    clients: {
      name: row.client_name,
      phone: row.client_phone,
      email: row.client_email,
      address: row.client_address,
    },
  }
}

// ================== CLIENTS ==================

export async function getClients() {
  return request('/api/clients')
}

export async function createClient(_businessId, clientData) {
  return request('/api/clients', { method: 'POST', body: clientData })
}

export async function updateClient(clientId, clientData) {
  return request('/api/clients', { method: 'PUT', body: { ...clientData, id: clientId } })
}

export async function deleteClient(clientId) {
  return request(`/api/clients?id=${encodeURIComponent(clientId)}`, { method: 'DELETE' })
}

// ================== JOBS ==================

export async function getJobs() {
  const { data } = await request('/api/jobs')
  return { data: data.map(nestClient) }
}

export async function createJob(_businessId, jobData) {
  return request('/api/jobs', { method: 'POST', body: jobData })
}

export async function updateJob(jobId, jobData) {
  return request('/api/jobs', { method: 'PUT', body: { ...jobData, id: jobId } })
}

export async function deleteJob(jobId) {
  return request(`/api/jobs?id=${encodeURIComponent(jobId)}`, { method: 'DELETE' })
}

// ================== INVOICES ==================

export async function getInvoices() {
  const { data } = await request('/api/invoices')
  return { data: data.map(nestClient) }
}

export async function createInvoice(_businessId, invoiceData) {
  return request('/api/invoices', { method: 'POST', body: invoiceData })
}

export async function updateInvoice(invoiceId, invoiceData) {
  return request('/api/invoices', { method: 'PUT', body: { ...invoiceData, id: invoiceId } })
}

export async function deleteInvoice(invoiceId) {
  return request(`/api/invoices?id=${encodeURIComponent(invoiceId)}`, { method: 'DELETE' })
}

// ================== DASHBOARD ==================

export async function getDashboardStats() {
  return request('/api/dashboard')
}
