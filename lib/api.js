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

export async function sendInvoiceEmail(invoiceId) {
  return request(`/api/invoices/${encodeURIComponent(invoiceId)}/send-email`, { method: 'POST' })
}

// ================== DASHBOARD ==================

export async function getDashboardStats() {
  return request('/api/dashboard')
}

// ================== REPORTS ==================

export async function getMonthlyReport(months = 6) {
  return request(`/api/reports?months=${months}`)
}

export async function getSurveySummary() {
  return request('/api/reports/surveys')
}

// ================== ROUTE ==================

export async function getTodaysRoute() {
  return request('/api/route/today')
}

// ================== JOB PHOTOS ==================

export async function getJobPhotos(jobId) {
  return request(`/api/jobs/${jobId}/photos`)
}

// Sube un archivo real (FormData): no puede pasar por request(), que siempre
// serializa el body como JSON.
export async function uploadJobPhoto(jobId, file, type) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)

  const res = await fetch(`/api/jobs/${jobId}/photos`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json.error || 'Error al subir la foto')
  }
  return json
}

export async function deleteJobPhoto(jobId, photoId) {
  return request(`/api/jobs/${jobId}/photos?id=${encodeURIComponent(photoId)}`, { method: 'DELETE' })
}

// ================== BUSINESS ==================

export async function updateBusiness(businessData) {
  return request('/api/business', { method: 'PUT', body: businessData })
}

// ================== MESSAGE TEMPLATES ==================

export async function getMessageTemplates() {
  return request('/api/message-templates')
}

export async function saveMessageTemplate(type, body) {
  return request('/api/message-templates', { method: 'PUT', body: { type, body } })
}

// ================== RECURRING JOBS ==================

export async function getRecurringJobs() {
  return request('/api/recurring-jobs')
}

export async function createRecurringJob(data) {
  return request('/api/recurring-jobs', { method: 'POST', body: data })
}

export async function setRecurringJobActive(id, active) {
  return request('/api/recurring-jobs', { method: 'PUT', body: { id, active } })
}

export async function deleteRecurringJob(id) {
  return request(`/api/recurring-jobs?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
}
