import postgres from 'postgres'

// Conexión a Neon.
// DECIMAL/NUMERIC llega como string desde PostgreSQL; lo convertimos a número
// porque las páginas hacen .toFixed() y sumas sobre estos campos.
const sql = postgres(process.env.DATABASE_URL, {
  types: {
    numeric: {
      to: 1700,
      from: [1700],
      serialize: (v) => String(v),
      parse: (v) => parseFloat(v),
    },
  },
})

// Todas las funciones de update/delete exigen businessId para que un usuario
// autenticado no pueda tocar registros de otro negocio (anti-IDOR).

// ================== USERS ==================

export async function createUser(email, passwordHash) {
  try {
    const result = await sql`
      INSERT INTO users (email, password_hash, created_at)
      VALUES (${email}, ${passwordHash}, NOW())
      RETURNING id, email, created_at
    `
    return result[0]
  } catch (error) {
    if (error.message.includes('duplicate')) {
      throw new Error('Email already exists')
    }
    throw error
  }
}

export async function getUserByEmail(email) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `
  return result[0]
}

export async function getUserById(userId) {
  const result = await sql`
    SELECT id, email, created_at FROM users WHERE id = ${userId}
  `
  return result[0]
}

// ================== BUSINESSES ==================

export async function createBusiness(userId, businessData) {
  const result = await sql`
    INSERT INTO businesses (user_id, name, phone, whatsapp_number, logo_url, currency, timezone, created_at, updated_at)
    VALUES (${userId}, ${businessData.name}, ${businessData.phone || null}, ${businessData.whatsapp_number || null},
            ${businessData.logo_url || null}, ${businessData.currency || 'EUR'}, ${businessData.timezone || 'Europe/Madrid'}, NOW(), NOW())
    RETURNING *
  `
  return result[0]
}

export async function getBusiness(userId) {
  const result = await sql`
    SELECT * FROM businesses WHERE user_id = ${userId}
  `
  return result[0]
}

export async function updateBusiness(businessId, userId, data) {
  const result = await sql`
    UPDATE businesses
    SET name = ${data.name}, phone = ${data.phone || null}, whatsapp_number = ${data.whatsapp_number || null},
        logo_url = ${data.logo_url || null}, updated_at = NOW()
    WHERE id = ${businessId} AND user_id = ${userId}
    RETURNING *
  `
  return result[0]
}

// ================== CLIENTS ==================

export async function createClient(businessId, clientData) {
  const result = await sql`
    INSERT INTO clients (business_id, name, phone, whatsapp_number, email, address, city, postal_code, service_type, notes, created_at, updated_at)
    VALUES (${businessId}, ${clientData.name}, ${clientData.phone || null}, ${clientData.whatsapp_number || null},
            ${clientData.email || null}, ${clientData.address || null}, ${clientData.city || null},
            ${clientData.postal_code || null}, ${clientData.service_type || null}, ${clientData.notes || null}, NOW(), NOW())
    RETURNING *
  `
  return result[0]
}

export async function getClients(businessId) {
  return sql`
    SELECT * FROM clients WHERE business_id = ${businessId} ORDER BY created_at DESC
  `
}

export async function getClient(clientId, businessId) {
  const result = await sql`
    SELECT * FROM clients WHERE id = ${clientId} AND business_id = ${businessId}
  `
  return result[0]
}

export async function updateClient(clientId, businessId, clientData) {
  const result = await sql`
    UPDATE clients
    SET name = ${clientData.name}, phone = ${clientData.phone || null}, whatsapp_number = ${clientData.whatsapp_number || null},
        email = ${clientData.email || null}, address = ${clientData.address || null}, city = ${clientData.city || null},
        postal_code = ${clientData.postal_code || null}, service_type = ${clientData.service_type || null},
        notes = ${clientData.notes || null}, updated_at = NOW()
    WHERE id = ${clientId} AND business_id = ${businessId}
    RETURNING *
  `
  return result[0]
}

export async function deleteClient(clientId, businessId) {
  const result = await sql`
    DELETE FROM clients WHERE id = ${clientId} AND business_id = ${businessId} RETURNING id
  `
  return result[0]
}

// ================== JOBS ==================

export async function createJob(businessId, jobData) {
  const result = await sql`
    INSERT INTO jobs (business_id, client_id, title, description, status, scheduled_date, completed_date,
                      service_type, duration_hours, materials_cost, labor_cost, total_amount, notes, created_at, updated_at)
    VALUES (${businessId}, ${jobData.client_id}, ${jobData.title}, ${jobData.description || null},
            ${jobData.status || 'pending'}, ${jobData.scheduled_date || null}, ${jobData.completed_date || null},
            ${jobData.service_type || null}, ${jobData.duration_hours || 0}, ${jobData.materials_cost || 0},
            ${jobData.labor_cost}, ${jobData.total_amount}, ${jobData.notes || null}, NOW(), NOW())
    RETURNING *
  `
  return result[0]
}

export async function getJobs(businessId, status = null) {
  return sql`
    SELECT j.*, c.name AS client_name, c.phone AS client_phone, c.email AS client_email
    FROM jobs j
    LEFT JOIN clients c ON j.client_id = c.id
    WHERE j.business_id = ${businessId}
    ${status ? sql`AND j.status = ${status}` : sql``}
    ORDER BY j.created_at DESC
  `
}

export async function getJob(jobId, businessId) {
  const result = await sql`
    SELECT j.*, c.name AS client_name, c.phone AS client_phone, c.email AS client_email
    FROM jobs j
    LEFT JOIN clients c ON j.client_id = c.id
    WHERE j.id = ${jobId} AND j.business_id = ${businessId}
  `
  return result[0]
}

export async function updateJob(jobId, businessId, jobData) {
  const result = await sql`
    UPDATE jobs
    SET title = ${jobData.title}, description = ${jobData.description || null}, status = ${jobData.status},
        scheduled_date = ${jobData.scheduled_date || null}, completed_date = ${jobData.completed_date || null},
        duration_hours = ${jobData.duration_hours || 0}, materials_cost = ${jobData.materials_cost || 0},
        labor_cost = ${jobData.labor_cost}, total_amount = ${jobData.total_amount},
        notes = ${jobData.notes || null}, updated_at = NOW()
    WHERE id = ${jobId} AND business_id = ${businessId}
    RETURNING *
  `
  return result[0]
}

export async function deleteJob(jobId, businessId) {
  const result = await sql`
    DELETE FROM jobs WHERE id = ${jobId} AND business_id = ${businessId} RETURNING id
  `
  return result[0]
}

// ================== INVOICES ==================

export async function createInvoice(businessId, invoiceData) {
  const result = await sql`
    INSERT INTO invoices (business_id, client_id, job_id, invoice_number, amount, tax, status,
                          due_date, sent_date, paid_date, invoice_url, created_at, updated_at)
    VALUES (${businessId}, ${invoiceData.client_id}, ${invoiceData.job_id || null}, ${invoiceData.invoice_number},
            ${invoiceData.amount}, ${invoiceData.tax || 0}, ${invoiceData.status || 'pending'},
            ${invoiceData.due_date || null}, ${invoiceData.sent_date || null}, ${invoiceData.paid_date || null},
            ${invoiceData.invoice_url || null}, NOW(), NOW())
    RETURNING *
  `
  return result[0]
}

export async function getInvoices(businessId) {
  return sql`
    SELECT i.*, c.name AS client_name, c.email AS client_email, c.phone AS client_phone, c.address AS client_address
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.business_id = ${businessId}
    ORDER BY i.created_at DESC
  `
}

export async function getInvoice(invoiceId, businessId) {
  const result = await sql`
    SELECT i.*, c.name AS client_name, c.email AS client_email, c.phone AS client_phone, c.address AS client_address
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.id = ${invoiceId} AND i.business_id = ${businessId}
  `
  return result[0]
}

export async function updateInvoice(invoiceId, businessId, invoiceData) {
  const result = await sql`
    UPDATE invoices
    SET amount = ${invoiceData.amount}, tax = ${invoiceData.tax || 0}, status = ${invoiceData.status},
        due_date = ${invoiceData.due_date || null}, sent_date = ${invoiceData.sent_date || null},
        paid_date = ${invoiceData.paid_date || null}, updated_at = NOW()
    WHERE id = ${invoiceId} AND business_id = ${businessId}
    RETURNING *
  `
  return result[0]
}

export async function deleteInvoice(invoiceId, businessId) {
  const result = await sql`
    DELETE FROM invoices WHERE id = ${invoiceId} AND business_id = ${businessId} RETURNING id
  `
  return result[0]
}

// ================== DASHBOARD STATS ==================

export async function getDashboardStats(businessId) {
  const [jobs, clients, invoices] = await Promise.all([
    sql`SELECT status, total_amount FROM jobs WHERE business_id = ${businessId}`,
    sql`SELECT id FROM clients WHERE business_id = ${businessId}`,
    sql`SELECT status, amount FROM invoices WHERE business_id = ${businessId}`,
  ])

  return { jobs, clients, invoices }
}

export { sql }
