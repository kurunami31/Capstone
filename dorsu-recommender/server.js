import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { pool, initDB } from './db.js'
import { GoogleGenAI } from '@google/genai'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'dorsu-recommender-secret-change-in-production'
const SALT_ROUNDS = 12
const TOKEN_EXPIRY = '1h'
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

const rateLimitStore = {}
const RATE_LIMIT_WINDOW = 15 * 60 * 1000
const RATE_LIMIT_MAX = 10

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress
  const now = Date.now()
  if (!rateLimitStore[ip] || rateLimitStore[ip].window < now - RATE_LIMIT_WINDOW) {
    rateLimitStore[ip] = { window: now, count: 0 }
  }
  rateLimitStore[ip].count++
  if (rateLimitStore[ip].count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' })
  }
  next()
}

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:")
  next()
})

function generateToken(user) {
  return jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role || 'user',
    firstName: user.firstName || user.first_name || '',
    lastName: user.lastName || user.last_name || '',
    name: [user.firstName || user.first_name || '', user.lastName || user.last_name || ''].filter(Boolean).join(' '),
  }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

function setTokenCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000,
  })
}

function authenticate(req, res, next) {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

app.post('/api/register', rateLimit, async (req, res) => {
  try {
    const { email, password, firstName, lastName, middleInitial, extensionName } = req.body

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'First name, last name, email, and password are required.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' })
    }
    if (firstName.trim().length < 1 || lastName.trim().length < 1) {
      return res.status(400).json({ error: 'First name and last name are required.' })
    }

    const lowerEmail = email.toLowerCase()
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [lowerEmail])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }

    const hashed = bcrypt.hashSync(password, SALT_ROUNDS)
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

    const role = ADMIN_EMAILS.includes(lowerEmail) ? 'admin' : 'user'

    const result = await pool.query(
      `INSERT INTO users (id, email, first_name, last_name, middle_initial, extension_name, password, avatar, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, '', $8, NOW(), NOW())
       RETURNING id, email, first_name, last_name, middle_initial, extension_name, avatar, role, created_at, updated_at`,
      [id, lowerEmail, firstName.trim(), lastName.trim(), middleInitial?.trim() || '', extensionName?.trim() || '', hashed, role]
    )

    const row = result.rows[0]
    const user = {
      id: row.id, email: row.email, avatar: row.avatar, role: row.role,
      firstName: row.first_name, lastName: row.last_name,
      middleInitial: row.middle_initial, extensionName: row.extension_name,
      name: [row.first_name, row.last_name].filter(Boolean).join(' '),
      createdAt: row.created_at, updatedAt: row.updated_at,
    }
    const token = generateToken(user)
    setTokenCookie(res, token)
    logActivity(row.id, 'register', `User registered: ${row.email}`, req.ip || '')
    res.json({ user })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Server error during registration.' })
  }
})

function mapUser(row) {
  return {
    id: row.id, email: row.email, avatar: row.avatar, role: row.role,
    firstName: row.first_name, lastName: row.last_name,
    middleInitial: row.middle_initial, extensionName: row.extension_name,
    name: [row.first_name, row.last_name].filter(Boolean).join(' '),
    createdAt: row.created_at, updatedAt: row.updated_at,
  }
}

app.post('/api/login', rateLimit, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const lowerEmail = email.toLowerCase()

    const result = await pool.query(
      'SELECT id, email, first_name, last_name, middle_initial, extension_name, password, avatar, role, created_at, updated_at FROM users WHERE email = $1',
      [lowerEmail]
    )

    const row = result.rows[0]
    if (!row || !bcrypt.compareSync(password, row.password)) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    if (ADMIN_EMAILS.includes(lowerEmail) && row.role !== 'admin') {
      await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', row.id])
      row.role = 'admin'
    }

    const { password: _, ...safe } = row
    const user = mapUser(row)
    const token = generateToken(user)
    setTokenCookie(res, token)
    logActivity(row.id, 'login', `User logged in: ${row.email}`, req.ip || '')
    res.json({ user })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error during login.' })
  }
})

app.post('/api/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' })
  res.json({ success: true })
})

app.get('/api/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, middle_initial, extension_name, avatar, role, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    res.json({ user: mapUser(result.rows[0]) })
  } catch (err) {
    console.error('/api/me error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

app.put('/api/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, middleInitial, extensionName, email } = req.body

    const check = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.user.id])
    if (check.rows.length === 0) return res.status(404).json({ error: 'User not found' })

    const updates = []
    const values = []
    let idx = 1

    if (firstName !== undefined) {
      if (firstName.trim().length < 1) return res.status(400).json({ error: 'First name is required.' })
      updates.push(`first_name = $${idx++}`)
      values.push(firstName.trim())
    }
    if (lastName !== undefined) {
      if (lastName.trim().length < 1) return res.status(400).json({ error: 'Last name is required.' })
      updates.push(`last_name = $${idx++}`)
      values.push(lastName.trim())
    }
    if (middleInitial !== undefined) {
      updates.push(`middle_initial = $${idx++}`)
      values.push(middleInitial.trim())
    }
    if (extensionName !== undefined) {
      updates.push(`extension_name = $${idx++}`)
      values.push(extensionName.trim())
    }

    if (email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email format.' })
      const lower = email.toLowerCase()
      if (lower !== check.rows[0].email) {
        const dup = await pool.query('SELECT id FROM users WHERE email = $1', [lower])
        if (dup.rows.length > 0) return res.status(409).json({ error: 'Email already in use.' })
      }
      updates.push(`email = $${idx++}`)
      values.push(lower)
    }

    if (updates.length === 0) {
      const current = await pool.query(
        'SELECT id, email, first_name, last_name, middle_initial, extension_name, avatar, role, created_at, updated_at FROM users WHERE id = $1',
        [req.user.id]
      )
      return res.json({ user: mapUser(current.rows[0]) })
    }

    updates.push(`updated_at = NOW()`)
    values.push(req.user.id)

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING id, email, first_name, last_name, middle_initial, extension_name, avatar, role, created_at, updated_at`,
      values
    )

    logActivity(req.user.id, 'profile_update', 'Profile updated', req.ip || '')
    res.json({ user: mapUser(result.rows[0]) })
  } catch (err) {
    console.error('Profile update error:', err)
    res.status(500).json({ error: 'Server error updating profile.' })
  }
})

app.put('/api/profile/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' })

    if (!bcrypt.compareSync(currentPassword, result.rows[0].password)) {
      return res.status(401).json({ error: 'Current password is incorrect.' })
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' })
    }

    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [bcrypt.hashSync(newPassword, SALT_ROUNDS), req.user.id]
    )

    logActivity(req.user.id, 'password_change', 'Password changed', req.ip || '')
    res.json({ success: true })
  } catch (err) {
    console.error('Password change error:', err)
    res.status(500).json({ error: 'Server error changing password.' })
  }
})

app.post('/api/profile/picture', authenticate, async (req, res) => {
  try {
    const { avatar } = req.body
    if (!avatar) return res.status(400).json({ error: 'Avatar data is required.' })
    if (avatar.length > 500000) return res.status(400).json({ error: 'Image too large. Max 500KB.' })

    const result = await pool.query(
      'UPDATE users SET avatar = $1, updated_at = NOW() WHERE id = $2 RETURNING avatar',
      [avatar, req.user.id]
    )

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' })
    res.json({ avatar: result.rows[0].avatar })
  } catch (err) {
    console.error('Picture upload error:', err)
    res.status(500).json({ error: 'Server error uploading picture.' })
  }
})

const SYSTEM_PROMPT = `You are a helpful assistant for the DOrSU (Davao Oriental State University) College Program Recommender System.

Your role is to answer questions about:
- How the recommender system works (assessments across SHS strand, grades, SUAST, Holland personality, interests, skills)
- The assessment steps (consent, welcome, strand, grades, suast, holland, interest, skills, results)
- The Holland Code / RIASEC personality types (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)
- The SUST aptitude exam simulation
- Data privacy under RA 10173 (Data Privacy Act of 2012)
- DOrSU college programs and how matches are calculated
- Account registration, login, profile editing, and password changes
- General questions about DOrSU and its programs

Keep answers concise, friendly, and helpful. If you don't know something, say so honestly. Do not make up information about specific program details you are not sure about. When asked about technical issues, suggest contacting the system administrator.

IMPORTANT: Do NOT use Markdown, bold, italic, or any formatting. Respond in plain text only.`

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' })
    }

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      const faqReplies = {
        'what is this': 'This is the DOrSU College Program Recommender System, a web-based tool that helps you find the best college programs at Davao Oriental State University based on your SHS strand, grades, aptitude, personality, interests, and skills.',
        'how does it work': 'The assessment has 8 steps: consent, welcome form, SHS strand selection, grade input, SUAST exam simulation, Holland personality quiz, interests, and skills. After completion, you get a ranked list of recommended programs.',
        'how do i start': 'Register an account, log in, then click "Get Started" on the landing page. You will be guided through each step of the assessment.',
        'privacy': 'The system complies with the Data Privacy Act of 2012 (RA 10173). Your data is stored securely and used only for generating recommendations. You must consent before proceeding.',
        'holland': 'The Holland Code (RIASEC) has six personality types: Realistic (R), Investigative (I), Artistic (A), Social (S), Enterprising (E), and Conventional (C). Your combination helps match you to compatible programs.',
        'suast': 'SUAST is the DOrSU Scholastic Aptitude Test simulation built into the system. It assesses your aptitude across several areas to help find programs that match your academic strengths.',
      }

      const lower = message.toLowerCase()
      let reply = null
      for (const [key, val] of Object.entries(faqReplies)) {
        if (lower.includes(key)) { reply = val; break }
      }

      if (reply) return res.json({ reply })

      return res.json({ reply: 'I\'m running in offline mode. Please set the GOOGLE_API_KEY environment variable to enable AI-powered responses. In the meantime, check the FAQ page for common questions.' })
    }

    const ai = new GoogleGenAI({ apiKey })

    const contents = []
    if (history && Array.isArray(history)) {
      for (const h of history) {
        if (h.role && h.text) {
          contents.push({ role: h.role, parts: [{ text: h.text }] })
        }
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] })

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    })

    let reply = (result.text || 'Sorry, I could not generate a response.')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim()
    res.json({ reply })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ error: 'Failed to get AI response.' })
  }
})

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' })
  }
  next()
}

async function logActivity(userId, actionType, details = '', ip = '') {
  try {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    await pool.query(
      'INSERT INTO activity_log (id, user_id, action_type, details, ip_address, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [id, userId, actionType, details, ip]
    )
  } catch (err) {
    console.error('Activity log error:', err)
  }
}

app.get('/api/admin/stats', authenticate, requireAdmin, async (_, res) => {
  try {
    const totalUsers = await pool.query("SELECT COUNT(*) FROM users WHERE email != 'admin@dorsu.edu.ph'")
    const adminCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin' AND email != 'admin@dorsu.edu.ph'")
    const recentUsers = await pool.query(
      "SELECT id, email, first_name, last_name, avatar, role, created_at FROM users WHERE email != 'admin@dorsu.edu.ph' ORDER BY created_at DESC LIMIT 5"
    )
    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count),
      adminCount: parseInt(adminCount.rows[0].count),
      recentUsers: recentUsers.rows.map(r => ({
        id: r.id, email: r.email, firstName: r.first_name, lastName: r.last_name,
        avatar: r.avatar, role: r.role, createdAt: r.created_at,
      })),
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    res.status(500).json({ error: 'Server error fetching stats.' })
  }
})

app.get('/api/admin/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const offset = (page - 1) * limit
    const search = req.query.search || ''

    let countQuery = "SELECT COUNT(*) FROM users WHERE email != 'admin@dorsu.edu.ph'"
    let dataQuery = "SELECT id, email, first_name, last_name, middle_initial, extension_name, avatar, role, created_at, updated_at FROM users WHERE email != 'admin@dorsu.edu.ph'"
    const params = []
    let paramIdx = 1

    if (search) {
      const filter = ` AND (LOWER(first_name) LIKE $${paramIdx} OR LOWER(last_name) LIKE $${paramIdx} OR LOWER(email) LIKE $${paramIdx})`
      countQuery += filter
      dataQuery += filter
      params.push(`%${search.toLowerCase()}%`)
      paramIdx++
    }

    dataQuery += ' ORDER BY created_at DESC LIMIT $' + paramIdx + ' OFFSET $' + (paramIdx + 1)
    params.push(limit, offset)

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, search ? [`%${search.toLowerCase()}%`] : []),
      pool.query(dataQuery, params),
    ])

    res.json({
      users: dataResult.rows.map(r => ({
        id: r.id, email: r.email, firstName: r.first_name, lastName: r.last_name,
        middleInitial: r.middle_initial, extensionName: r.extension_name,
        avatar: r.avatar, role: r.role, createdAt: r.created_at, updatedAt: r.updated_at,
      })),
      total: parseInt(countResult.rows[0].count),
      page, limit,
    })
  } catch (err) {
    console.error('Admin users error:', err)
    res.status(500).json({ error: 'Server error fetching users.' })
  }
})

app.delete('/api/admin/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' })
    }
    const target = await pool.query('SELECT email FROM users WHERE id = $1', [req.params.id])
    if (target.rows.length > 0 && target.rows[0].email === 'admin@dorsu.edu.ph') {
      return res.status(400).json({ error: 'Cannot delete the built-in admin account.' })
    }
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' })
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Admin delete user error:', err)
    res.status(500).json({ error: 'Server error deleting user.' })
  }
})

app.post('/api/assessment/save', authenticate, async (req, res) => {
  try {
    const { strand, gwa, hollandCode, topPrograms } = req.body
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    await pool.query(
      `INSERT INTO assessments (id, user_id, strand, gwa, holland_code, top_programs, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [id, req.user.id, strand || '', gwa || 0, hollandCode || '[]', JSON.stringify(topPrograms || [])]
    )
    logActivity(req.user.id, 'assessment_save', 'Assessment completed', req.ip || '')
    res.json({ success: true })
  } catch (err) {
    console.error('Assessment save error:', err)
    res.status(500).json({ error: 'Server error saving assessment.' })
  }
})

app.get('/api/admin/analytics/user-growth', authenticate, requireAdmin, async (_, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*)::int AS count
      FROM users
      WHERE email != 'admin@dorsu.edu.ph'
      GROUP BY month
      ORDER BY month ASC
      LIMIT 12
    `)
    res.json(result.rows.map(r => ({ month: r.month, count: r.count })))
  } catch (err) {
    console.error('User growth error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

app.get('/api/admin/analytics/program-popularity', authenticate, requireAdmin, async (_, res) => {
  try {
    const result = await pool.query('SELECT top_programs FROM assessments')
    const counts = {}
    let total = 0
    for (const row of result.rows) {
      const programs = JSON.parse(row.top_programs || '[]')
      for (const code of programs) {
        counts[code] = (counts[code] || 0) + 1
        total++
      }
    }
    const top = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([program, count]) => ({ program, count, percentage: total > 0 ? Math.round(count / total * 100) : 0 }))
    res.json(top)
  } catch (err) {
    console.error('Program popularity error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

app.get('/api/admin/analytics/holland-distribution', authenticate, requireAdmin, async (_, res) => {
  try {
    const result = await pool.query("SELECT holland_code FROM assessments WHERE holland_code != ''")
    const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
    for (const row of result.rows) {
      for (const letter of (row.holland_code || '').toUpperCase()) {
        if (counts[letter] !== undefined) counts[letter]++
      }
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    res.json(Object.entries(counts).map(([code, count]) => ({ code, count, percentage: total > 0 ? Math.round(count / total * 100) : 0 })))
  } catch (err) {
    console.error('Holland distribution error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

app.get('/api/admin/analytics/strand-distribution', authenticate, requireAdmin, async (_, res) => {
  try {
    const result = await pool.query(`
      SELECT strand, COUNT(*)::int AS count
      FROM assessments
      WHERE strand != ''
      GROUP BY strand
      ORDER BY count DESC
    `)
    const total = result.rows.reduce((a, r) => a + r.count, 0) || 1
    res.json(result.rows.map(r => ({ strand: r.strand, count: r.count, percentage: Math.round(r.count / total * 100) })))
  } catch (err) {
    console.error('Strand distribution error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

app.get('/api/admin/users/export', authenticate, requireAdmin, async (_, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, first_name, last_name, middle_initial, extension_name, role, created_at, updated_at FROM users WHERE email != 'admin@dorsu.edu.ph' ORDER BY created_at DESC"
    )
    const headers = 'ID,Email,First Name,Last Name,Middle Initial,Extension,Role,Created At,Updated At'
    const rows = result.rows.map(r =>
      `"${r.id}","${r.email}","${r.first_name || ''}","${r.last_name || ''}","${r.middle_initial || ''}","${r.extension_name || ''}","${r.role}","${r.created_at?.toISOString?.() || r.created_at || ''}","${r.updated_at?.toISOString?.() || r.updated_at || ''}"`
    )
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv')
    res.send([headers, ...rows].join('\n'))
  } catch (err) {
    console.error('Export users error:', err)
    res.status(500).json({ error: 'Server error exporting users.' })
  }
})

app.use(express.static(join(__dirname, 'dist')))

app.get('/{*path}', (_, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

// ---- Activity Log ----
app.get('/api/admin/activity', authenticate, requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 500)
    const result = await pool.query(
      `SELECT a.id, a.user_id, a.action_type, a.details, a.ip_address, a.created_at,
              u.email, u.first_name, u.last_name
       FROM activity_log a
       LEFT JOIN users u ON u.id = a.user_id
       ORDER BY a.created_at DESC
       LIMIT $1`,
      [limit]
    )
    res.json(result.rows)
  } catch (err) {
    console.error('Activity log fetch error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Toggle program active status ----
app.put('/api/admin/programs/:code/toggle', authenticate, requireAdmin, async (req, res) => {
  try {
    const { code } = req.params
    const existing = await pool.query('SELECT * FROM program_settings WHERE program_code = $1', [code])
    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO program_settings (program_code, active) VALUES ($1, false)',
        [code]
      )
      logActivity(req.user.id, 'program_toggle', `Disabled program: ${code}`, req.ip || '')
      return res.json({ code, active: false })
    }
    const newActive = !existing.rows[0].active
    await pool.query(
      'UPDATE program_settings SET active = $1, updated_at = NOW() WHERE program_code = $2',
      [newActive, code]
    )
    logActivity(req.user.id, 'program_toggle', `${newActive ? 'Enabled' : 'Disabled'} program: ${code}`, req.ip || '')
    res.json({ code, active: newActive })
  } catch (err) {
    console.error('Program toggle error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Get program active statuses ----
app.get('/api/programs/status', authenticate, async (_, res) => {
  try {
    const result = await pool.query('SELECT program_code, active FROM program_settings')
    const map = {}
    for (const row of result.rows) {
      map[row.program_code] = row.active
    }
    res.json(map)
  } catch (err) {
    console.error('Program status error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Get system settings ----
app.get('/api/settings', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const result = await pool.query('SELECT key, value FROM system_settings')
      const map = {}
      for (const row of result.rows) {
        map[row.key] = row.value
      }
      return res.json(map)
    }
    // Students can only read non-admin settings
    const result = await pool.query('SELECT key, value FROM system_settings WHERE key NOT LIKE $1', ['admin_%'])
    const map = {}
    for (const row of result.rows) {
      map[row.key] = row.value
    }
    res.json(map)
  } catch (err) {
    console.error('Settings fetch error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Update system settings (admin only) ----
app.put('/api/admin/settings', authenticate, requireAdmin, async (req, res) => {
  try {
    const { settings } = req.body
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object required.' })
    }
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO system_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, String(value)]
      )
    }
    logActivity(req.user.id, 'settings_update', `Updated settings: ${Object.keys(settings).join(', ')}`, req.ip || '')
    res.json({ success: true })
  } catch (err) {
    console.error('Settings update error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

initDB().then(async () => {
  const ADMIN_EMAIL = 'admin@dorsu.edu.ph'
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [ADMIN_EMAIL])
  if (existing.rows.length === 0) {
    const adminPwd = 'Admin' + Math.random().toString(36).slice(2, 6).toUpperCase()
    const hashed = bcrypt.hashSync(adminPwd, SALT_ROUNDS)
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    await pool.query(
      `INSERT INTO users (id, email, first_name, last_name, password, avatar, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, '', 'admin', NOW(), NOW())`,
      [id, ADMIN_EMAIL, 'Admin', 'User', hashed]
    )
    console.log('')
    console.log('=== DEFAULT ADMIN ACCOUNT ===')
    console.log(`   Email:    ${ADMIN_EMAIL}`)
    console.log(`   Password: ${adminPwd}`)
    console.log('=============================')
    console.log('')
  }

  // Auto-populate program_settings with all programs enabled by default
  const progCount = await pool.query('SELECT COUNT(*)::int AS cnt FROM program_settings')
  if (progCount.rows[0].cnt === 0) {
    const programs = await pool.query('SELECT code FROM programs')
    for (const prog of programs.rows) {
      await pool.query(
        'INSERT INTO program_settings (program_code, active) VALUES ($1, true) ON CONFLICT DO NOTHING',
        [prog.code]
      )
    }
    console.log(`Auto-populated ${programs.rows.length} program settings.`)
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch(err => {
  console.error('Failed to initialize database:', err)
  process.exit(1)
})
