import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/dorsu_recommender',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
})

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      last_name TEXT NOT NULL DEFAULT '',
      first_name TEXT NOT NULL DEFAULT '',
      middle_initial TEXT NOT NULL DEFAULT '',
      extension_name TEXT NOT NULL DEFAULT '',
      password TEXT NOT NULL,
      avatar TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT ''
  `).catch(() => {})
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT ''
  `).catch(() => {})
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS middle_initial TEXT DEFAULT ''
  `).catch(() => {})
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS extension_name TEXT DEFAULT ''
  `).catch(() => {})

  await pool.query(`
    ALTER TABLE users DROP COLUMN IF EXISTS name
  `).catch(() => {})

  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  `).catch(() => {})

  console.log('Database initialized.')
}

export { pool, initDB }
