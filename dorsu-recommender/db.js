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
      full_data JSONB,
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS assessment_progress (
      user_id TEXT PRIMARY KEY REFERENCES users(id),
      step INTEGER NOT NULL DEFAULT 0,
      data JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS counselor_notes (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL REFERENCES assessments(id),
      counselor_id TEXT NOT NULL REFERENCES users(id),
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS assessment_questions (
      id TEXT PRIMARY KEY,
      step TEXT NOT NULL,
      question_key TEXT NOT NULL,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL DEFAULT 'text',
      options JSONB DEFAULT '[]',
      sort_order INTEGER NOT NULL DEFAULT 0,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false
  `).catch(() => {})

  await pool.query(`
    CREATE TABLE IF NOT EXISTS email_verifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  // Mark existing users created before email verification feature as verified
  await pool.query("UPDATE users SET email_verified = true WHERE email_verified IS NULL").catch(() => {})

  // Performance indexes
  await pool.query('CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id)').catch(() => {})
  await pool.query('CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at)').catch(() => {})
  await pool.query('CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id)').catch(() => {})
  await pool.query('CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at)').catch(() => {})
  await pool.query('CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token)').catch(() => {})
  await pool.query('CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token)').catch(() => {})
  await pool.query('CREATE INDEX IF NOT EXISTS idx_counselor_notes_assessment_id ON counselor_notes(assessment_id)').catch(() => {})
  await pool.query(`ALTER TABLE assessments ADD COLUMN IF NOT EXISTS full_data JSONB`).catch(() => {})

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      program_code TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, program_code)
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      role TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query('CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id)').catch(() => {})

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL DEFAULT 'info',
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      link TEXT NOT NULL DEFAULT '',
      is_read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await pool.query('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)').catch(() => {})

  await pool.query(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT ''
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      achievement_key TEXT NOT NULL REFERENCES achievements(key),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, achievement_key)
    )
  `)

  // Seed default achievements
  const defaultAchievements = [
    { key: 'first_assessment', name: 'First Steps', description: 'Complete your first assessment' },
    { key: 'explorer', name: 'Explorer', description: 'Compare 3 or more programs' },
    { key: 'scholar', name: 'Scholar', description: 'Achieve a GWA of 90 or higher' },
    { key: 'committed', name: 'Committed', description: 'Save 5 or more programs to favorites' },
    { key: 'veteran', name: 'Veteran', description: 'Take 3 or more assessments' },
  ]
  for (const a of defaultAchievements) {
    await pool.query(
      `INSERT INTO achievements (id, key, name, description) VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING`,
      [a.key, a.key, a.name, a.description]
    )
  }

  console.log('Database initialized.')
}

export { pool, initDB }
