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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      strand TEXT NOT NULL DEFAULT '',
      gwa REAL NOT NULL DEFAULT 0,
      holland_code TEXT NOT NULL DEFAULT '',
      top_programs TEXT NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      action_type TEXT NOT NULL,
      details TEXT NOT NULL DEFAULT '',
      ip_address TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS program_settings (
      code TEXT PRIMARY KEY,
      active BOOLEAN NOT NULL DEFAULT true
    )
  `)
  await pool.query(`ALTER TABLE program_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, ['academic_weight', '0.45'])
  await pool.query(`INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, ['suast_weight', '0.30'])
  await pool.query(`INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, ['personal_weight', '0.25'])
  await pool.query(`INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, ['holland_match_weight', '0.50'])
  await pool.query(`INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, ['interest_match_weight', '0.30'])
  await pool.query(`INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, ['skills_match_weight', '0.20'])
  await pool.query(`INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`, ['results_count', '10'])

  console.log('Database initialized.')
}

export { pool, initDB }
