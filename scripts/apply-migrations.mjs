// Aplica migrations/*.sql en orden sobre una base ya provisionada con setup-neon.sql.
// (setup-neon.sql es el bootstrap de una instalación nueva, no se ejecuta aquí:
// sus CREATE INDEX ya asumen columnas que solo existen tras aplicar las migraciones.)
// Uso: npm run migrate
import postgres from 'postgres'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  const content = readFileSync(join(rootDir, '.env.local'), 'utf8')
  const match = content.match(/^DATABASE_URL=(.+)$/m)
  if (!match) throw new Error('DATABASE_URL no encontrada en .env.local')
  return match[1].trim()
}

async function run() {
  const sql = postgres(loadDatabaseUrl())

  const files = readdirSync(join(rootDir, 'migrations'))
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => `migrations/${f}`)

  for (const file of files) {
    const content = readFileSync(join(rootDir, file), 'utf8')
    const statements = content
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)

    console.log(`Aplicando ${file} (${statements.length} sentencias)...`)
    for (const statement of statements) {
      await sql.unsafe(statement)
    }
  }

  await sql.end()
  console.log('Migraciones aplicadas correctamente.')
}

run().catch((error) => {
  console.error('Error aplicando migraciones:', error.message)
  process.exit(1)
})
