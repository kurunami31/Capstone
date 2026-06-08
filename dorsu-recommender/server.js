import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { pool, initDB } from './db.js'
import { sendEmail, notifyAssessmentCompleted, notifyAccountCreated, notifySettingsChanged } from './email.js'
import { GoogleGenAI } from '@google/genai'
import * as Sentry from '@sentry/node'

const __dirname = dirname(fileURLToPath(import.meta.url))

if (process.env.SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1,
    })
    console.log('Sentry initialized')
  } catch (e) {
    console.error('Sentry init failed:', e.message)
  }
}

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'dorsu-recommender-secret-change-in-production'
const USE_INSECURE_JWT = !process.env.JWT_SECRET
if (USE_INSECURE_JWT) {
  console.warn('WARNING: JWT_SECRET not set. Using insecure fallback. Set JWT_SECRET in production.')
}
const SALT_ROUNDS = 12
const TOKEN_EXPIRY = '1h'
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

const rateLimitStore = {}
const RATE_LIMIT_WINDOW = 15 * 60 * 1000
const AUTH_RATE_LIMIT_MAX = 100
const UNAUTH_RATE_LIMIT_MAX = 60

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

// Rate limit all /api/ routes — authenticated users get higher limits
app.use('/api', (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress
  const now = Date.now()
  const key = ip
  if (!rateLimitStore[key] || rateLimitStore[key].window < now - RATE_LIMIT_WINDOW) {
    rateLimitStore[key] = { window: now, count: 0 }
  }
  rateLimitStore[key].count++
  const max = req.headers.cookie?.includes('token=') ? AUTH_RATE_LIMIT_MAX : UNAUTH_RATE_LIMIT_MAX
  if (rateLimitStore[key].count > max) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' })
  }
  next()
})

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

app.post('/api/register', async (req, res) => {
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

    const hashed = await bcrypt.hash(password, SALT_ROUNDS)
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

    let role = 'user'
    if (lowerEmail === 'admin@dorsu.edu.ph') role = 'super_admin'
    else if (ADMIN_EMAILS.includes(lowerEmail)) role = 'admin'

    const result = await pool.query(
      `INSERT INTO users (id, email, first_name, last_name, middle_initial, extension_name, password, avatar, role, email_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, '', $8, false, NOW(), NOW())
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
    notifyAccountCreated(user)
    // Send verification email
    const verifToken = crypto.randomBytes(32).toString('hex')
    const verifExpires = new Date(Date.now() + 48 * 60 * 60 * 1000)
    await pool.query(
      'INSERT INTO email_verifications (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
      [Date.now().toString(36) + Math.random().toString(36).slice(2, 8), row.id, verifToken, verifExpires]
    )
    const verifUrl = `${req.protocol}://${req.get('host')}/verify-email?token=${verifToken}`
    sendEmail({
      to: row.email,
      subject: 'Verify Your Email — DOrSU Recommender',
      html: `<div style="font-family:sans-serif;max-width:500px">
        <h2 style="color:#1e3a5f">Verify Your Email</h2>
        <p>Hi ${row.first_name || 'Student'},</p>
        <p>Thanks for registering! Click the link below to verify your email address. This link expires in 48 hours.</p>
        <a href="${verifUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;margin:16px 0">Verify Email</a>
        <p style="color:#64748b;font-size:13px">If you did not create an account, please ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0"/>
        <p style="font-size:12px;color:#94a3b8">DOrSU Program Recommender System</p>
      </div>`,
    })
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

app.post('/api/login', async (req, res) => {
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
    if (!row || !(await bcrypt.compare(password, row.password))) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    if (lowerEmail === 'admin@dorsu.edu.ph' && row.role !== 'super_admin') {
      await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['super_admin', row.id])
      row.role = 'super_admin'
    } else if (ADMIN_EMAILS.includes(lowerEmail) && !['admin', 'super_admin'].includes(row.role)) {
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

    if (!(await bcrypt.compare(currentPassword, result.rows[0].password))) {
      return res.status(401).json({ error: 'Current password is incorrect.' })
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' })
    }

    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [await bcrypt.hash(newPassword, SALT_ROUNDS), req.user.id]
    )

    // Rotate JWT after password change
    const userRow = await pool.query(
      'SELECT id, email, first_name, last_name, middle_initial, extension_name, avatar, role, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    )
    if (userRow.rows.length > 0) {
      const newToken = generateToken(mapUser(userRow.rows[0]))
      setTokenCookie(res, newToken)
    }

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

// Rate limiting for sensitive endpoints (separate from global rate limiter)
const sensitiveRateLimit = new Map()
function checkSensitiveRateLimit(key, max, windowMs) {
  const now = Date.now()
  const entry = sensitiveRateLimit.get(key)
  if (!entry || entry.window < now - windowMs) {
    sensitiveRateLimit.set(key, { window: now, count: 1 })
    return true
  }
  entry.count++
  if (entry.count > max) return false
  return true
}

app.post('/api/chat', authenticate, async (req, res) => {
  if (!checkSensitiveRateLimit(`chat_${req.user.id}`, 30, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' })
  }
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
      model: 'gemini-2.0-flash',
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

function requireManager(req, res, next) {
  if (!['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required.' })
  }
  next()
}

function requireStaff(req, res, next) {
  if (!['admin', 'super_admin', 'department_head'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Staff access required.' })
  }
  next()
}

function requireSuperAdmin(req, res, next) {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required.' })
  }
  next()
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` })
    }
    next()
  }
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

app.get('/api/admin/stats', authenticate, requireStaff, async (_, res) => {
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

app.get('/api/admin/users', authenticate, requireManager, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const offset = (page - 1) * limit
    const search = req.query.search || ''

    const conditions = ["email != 'admin@dorsu.edu.ph'"]
    const params = []
    let paramIdx = 1

    // Admin (not super_admin) cannot see other admin or super_admin accounts
    if (req.user.role === 'admin') {
      conditions.push(`id != $${paramIdx}`)
      params.push(req.user.id)
      paramIdx++
      conditions.push(`role NOT IN ('admin', 'super_admin')`)
    }

    let whereClause = 'WHERE ' + conditions.join(' AND ')

    let countQuery = 'SELECT COUNT(*) FROM users ' + whereClause
    let dataQuery = 'SELECT id, email, first_name, last_name, middle_initial, extension_name, avatar, role, created_at, updated_at FROM users ' + whereClause

    if (search) {
      const filter = ` AND (LOWER(first_name) LIKE $${paramIdx} OR LOWER(last_name) LIKE $${paramIdx} OR LOWER(email) LIKE $${paramIdx})`
      countQuery += filter
      dataQuery += filter
      params.push(`%${search.toLowerCase()}%`)
      paramIdx++
    }

    dataQuery += ' ORDER BY created_at DESC LIMIT $' + paramIdx + ' OFFSET $' + (paramIdx + 1)
    params.push(limit, offset)

    let dataParams = [...params]
    // Build count params (same as data params but without LIMIT/OFFSET)
    let countParams = []
    let ci = 1
    if (req.user.role === 'admin') { countParams.push(req.user.id); ci++ }
    if (search) countParams.push(`%${search.toLowerCase()}%`)

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, countParams),
      pool.query(dataQuery, dataParams),
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

app.delete('/api/admin/users/:id', authenticate, requireManager, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' })
    }
    const target = await pool.query('SELECT email, role FROM users WHERE id = $1', [req.params.id])
    if (target.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' })
    }
    if (target.rows[0].email === 'admin@dorsu.edu.ph') {
      return res.status(400).json({ error: 'Cannot delete the built-in admin account.' })
    }
    if (req.user.role === 'admin' && ['admin', 'super_admin'].includes(target.rows[0].role)) {
      return res.status(403).json({ error: 'You cannot delete other admin users.' })
    }
    // Cascade delete child records
    await pool.query('DELETE FROM assessment_progress WHERE user_id = $1', [req.params.id])
    await pool.query('DELETE FROM activity_log WHERE user_id = $1', [req.params.id])
    await pool.query('DELETE FROM email_verifications WHERE user_id = $1', [req.params.id])
    await pool.query('DELETE FROM password_resets WHERE user_id = $1', [req.params.id])
    await pool.query('DELETE FROM counselor_notes WHERE assessment_id IN (SELECT id FROM assessments WHERE user_id = $1)', [req.params.id])
    await pool.query('DELETE FROM assessments WHERE user_id = $1', [req.params.id])
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    console.error('Admin delete user error:', err)
    res.status(500).json({ error: 'Server error deleting user.' })
  }
})

// ---- Admin edit user details and role ----
app.put('/api/admin/users/:id', authenticate, requireManager, async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body

    // Cannot change your own role
    if (req.params.id === req.user.id && role && role !== req.user.role) {
      return res.status(400).json({ error: 'You cannot change your own role.' })
    }

    // Get target user's current role
    const target = await pool.query('SELECT role FROM users WHERE id = $1', [req.params.id])
    if (target.rows.length === 0) return res.status(404).json({ error: 'User not found.' })
    const targetRole = target.rows[0].role

    // Admin (not super_admin) cannot edit other admins or super_admins
    if (req.user.role === 'admin' && ['admin', 'super_admin'].includes(targetRole) && req.params.id !== req.user.id) {
      return res.status(403).json({ error: 'You cannot edit other admin users.' })
    }

    // Super admin only guard for sensitive operations
    if (req.user.role === 'admin') {
      if (role === 'super_admin') {
        return res.status(403).json({ error: 'Only super admins can grant the super_admin role.' })
      }
    }

    const updates = []
    const values = []
    let idx = 1

    if (firstName !== undefined) {
      if (firstName.trim().length < 1) return res.status(400).json({ error: 'First name is required.' })
      updates.push(`first_name = $${idx++}`)
      values.push(firstName.trim())
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${idx++}`)
      values.push(lastName.trim())
    }
    if (email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email format.' })
      const lower = email.toLowerCase()
      const dup = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [lower, req.params.id])
      if (dup.rows.length > 0) return res.status(409).json({ error: 'Email already in use.' })
      updates.push(`email = $${idx++}`)
      values.push(lower)
    }
    if (role !== undefined) {
      if (!['user', 'admin', 'counselor', 'department_head'].includes(role)) return res.status(400).json({ error: 'Invalid role.' })
      updates.push(`role = $${idx++}`)
      values.push(role)
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update.' })
    updates.push('updated_at = NOW()')
    values.push(req.params.id)

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING id, email, first_name, last_name, role, created_at, updated_at`,
      values
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' })

    logActivity(req.user.id, 'user_edit', `Edited user ${req.params.id}`, req.ip || '')
    res.json({ user: result.rows[0] })
  } catch (err) {
    console.error('Admin edit user error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Admin: reset student retake cooldown ----
app.post('/api/admin/users/:id/reset-cooldown', authenticate, requireManager, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM assessments WHERE user_id = $1 AND created_at = (SELECT MAX(created_at) FROM assessments WHERE user_id = $1) RETURNING id',
      [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No assessments found for this user.' })
    }
    logActivity(req.user.id, 'cooldown_reset', `Reset cooldown for user ${req.params.id}`, req.ip || '')
    res.json({ success: true })
  } catch (err) {
    console.error('Reset cooldown error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Counselor: list assessments for review ----
function requireCounselor(req, res, next) {
  return requireRole('admin', 'super_admin', 'counselor')(req, res, next)
}

app.get('/api/counselor/assessments', authenticate, requireCounselor, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20))
    const offset = (page - 1) * limit

    const countResult = await pool.query('SELECT COUNT(*)::int AS cnt FROM assessments')
    const total = countResult.rows[0].cnt

    const result = await pool.query(`
      SELECT
        a.id, a.user_id, a.strand, a.gwa, a.holland_code, a.top_programs, a.created_at,
        u.email, u.first_name, u.last_name,
        cn.id AS note_id, cn.notes, cn.status AS review_status, cn.updated_at AS note_updated_at
      FROM assessments a
      JOIN users u ON u.id = a.user_id
      LEFT JOIN counselor_notes cn ON cn.assessment_id = a.id
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])
    const programMap = {}
    for (const p of programs) programMap[p.code] = p.name

    const assessments = result.rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      studentName: `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email,
      email: r.email,
      strand: r.strand,
      gwa: r.gwa,
      hollandCode: r.holland_code,
      topPrograms: JSON.parse(r.top_programs || '[]').map(code => ({ code, name: programMap[code] || code })),
      createdAt: r.created_at,
      noteId: r.note_id,
      notes: r.notes || '',
      reviewStatus: r.review_status || 'pending',
      noteUpdatedAt: r.note_updated_at,
    }))
    res.json({ assessments, total, page, limit })
  } catch (err) {
    console.error('Counselor assessments error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

app.post('/api/counselor/notes', authenticate, requireCounselor, async (req, res) => {
  try {
    const { assessmentId, notes, status } = req.body
    if (!assessmentId) return res.status(400).json({ error: 'Assessment ID required.' })

    const existing = await pool.query('SELECT id FROM counselor_notes WHERE assessment_id = $1', [assessmentId])
    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE counselor_notes SET notes = $1, status = $2, updated_at = NOW() WHERE assessment_id = $3',
        [notes || '', status || 'pending', assessmentId]
      )
    } else {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
      await pool.query(
        'INSERT INTO counselor_notes (id, assessment_id, counselor_id, notes, status) VALUES ($1, $2, $3, $4, $5)',
        [id, assessmentId, req.user.id, notes || '', status || 'pending']
      )
    }
    logActivity(req.user.id, 'counselor_note', `Updated notes for assessment ${assessmentId}`, req.ip || '')
    res.json({ success: true })
  } catch (err) {
    console.error('Counselor notes error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Assessment questions CRUD (admin only) ----
app.get('/api/admin/questions', authenticate, requireManager, async (_, res) => {
  try {
    const result = await pool.query('SELECT * FROM assessment_questions ORDER BY sort_order ASC, created_at ASC')
    res.json(result.rows)
  } catch (err) {
    console.error('Get questions error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

app.post('/api/admin/questions', authenticate, requireManager, async (req, res) => {
  try {
    const { step, questionKey, questionText, questionType, options, sortOrder } = req.body
    if (!step || !questionKey || !questionText) {
      return res.status(400).json({ error: 'Step, question key, and question text are required.' })
    }
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    await pool.query(
      `INSERT INTO assessment_questions (id, step, question_key, question_text, question_type, options, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, step, questionKey, questionText, questionType || 'text', JSON.stringify(options || []), sortOrder || 0]
    )
    logActivity(req.user.id, 'question_create', `Created question: ${questionKey} (${step})`, req.ip || '')
    res.json({ success: true, id })
  } catch (err) {
    console.error('Create question error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

app.put('/api/admin/questions/:id', authenticate, requireManager, async (req, res) => {
  try {
    const { questionText, questionType, options, sortOrder, active } = req.body
    const sets = []
    const vals = []
    let idx = 1
    if (questionText !== undefined) { sets.push(`question_text = $${idx++}`); vals.push(questionText) }
    if (questionType !== undefined) { sets.push(`question_type = $${idx++}`); vals.push(questionType) }
    if (options !== undefined) { sets.push(`options = $${idx++}`); vals.push(JSON.stringify(options)) }
    if (sortOrder !== undefined) { sets.push(`sort_order = $${idx++}`); vals.push(sortOrder) }
    if (active !== undefined) { sets.push(`active = $${idx++}`); vals.push(active) }
    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update.' })
    vals.push(req.params.id)
    await pool.query(`UPDATE assessment_questions SET ${sets.join(', ')} WHERE id = $${idx}`, vals)
    logActivity(req.user.id, 'question_update', `Updated question ${req.params.id}`, req.ip || '')
    res.json({ success: true })
  } catch (err) {
    console.error('Update question error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

app.delete('/api/admin/questions/:id', authenticate, requireManager, async (req, res) => {
  try {
    await pool.query('DELETE FROM assessment_questions WHERE id = $1', [req.params.id])
    logActivity(req.user.id, 'question_delete', `Deleted question ${req.params.id}`, req.ip || '')
    res.json({ success: true })
  } catch (err) {
    console.error('Delete question error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Get active questions for a step (student-facing) ----
app.get('/api/questions/:step', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, question_key, question_text, question_type, options, sort_order FROM assessment_questions WHERE step = $1 AND active = true ORDER BY sort_order ASC',
      [req.params.step]
    )
    if (result.rows.length === 0) {
      return res.json({ questions: [] })
    }
    res.json({ questions: result.rows.map(r => ({
      ...r,
      options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options,
    })) })
  } catch (err) {
    console.error('Get step questions error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

app.post('/api/assessment/save', authenticate, async (req, res) => {
  try {
    const { strand, gwa, hollandCode, topPrograms } = req.body
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    // Check cooldown unless admin/counselor
    if (req.user.role === 'user') {
      const last = await pool.query(
        'SELECT created_at FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [req.user.id]
      )
      if (last.rows.length > 0) {
        const daysSince = (Date.now() - new Date(last.rows[0].created_at).getTime()) / (1000 * 60 * 60 * 24)
        if (daysSince < 120) {
          const daysLeft = Math.ceil(120 - daysSince)
          return res.status(429).json({ error: `Please wait ${daysLeft} more day${daysLeft === 1 ? '' : 's'} before retaking.` })
        }
      }
    }
    await pool.query(
      `INSERT INTO assessments (id, user_id, strand, gwa, holland_code, top_programs, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [id, req.user.id, strand || '', gwa || 0, hollandCode || '[]', JSON.stringify(topPrograms || [])]
    )
    // Clear saved progress on completion
    await pool.query('DELETE FROM assessment_progress WHERE user_id = $1', [req.user.id])
    logActivity(req.user.id, 'assessment_save', 'Assessment completed', req.ip || '')
    const userResult = await pool.query('SELECT email, first_name, last_name FROM users WHERE id = $1', [req.user.id])
    if (userResult.rows.length > 0) {
      notifyAssessmentCompleted(userResult.rows[0], topPrograms || [])
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Assessment save error:', err)
    res.status(500).json({ error: 'Server error saving assessment.' })
  }
})

// ---- Student assessment history ----
app.get('/api/assessments/history', authenticate, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20))
    const offset = (page - 1) * limit

    const countResult = await pool.query(
      'SELECT COUNT(*)::int AS cnt FROM assessments WHERE user_id = $1',
      [req.user.id]
    )
    const total = countResult.rows[0].cnt

    const result = await pool.query(
      `SELECT id, strand, gwa, holland_code, top_programs, created_at
       FROM assessments WHERE user_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    )

    const programMap = {}
    for (const p of programs) programMap[p.code] = p.name

    const history = result.rows.map(r => ({
      id: r.id,
      strand: r.strand,
      gwa: r.gwa,
      hollandCode: r.holland_code,
      topPrograms: JSON.parse(r.top_programs || '[]').map(code => ({
        code,
        name: programMap[code] || code,
      })),
      createdAt: r.created_at,
    }))
    res.json({ history, total, page, limit })
  } catch (err) {
    console.error('Assessment history error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Save/resume assessment progress ----
app.get('/api/assessment/progress', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT step, data, updated_at FROM assessment_progress WHERE user_id = $1',
      [req.user.id]
    )
    if (result.rows.length === 0) return res.json({ progress: null })
    res.json({ progress: { step: result.rows[0].step, data: result.rows[0].data, updatedAt: result.rows[0].updated_at } })
  } catch (err) {
    console.error('Get progress error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

app.put('/api/assessment/progress', authenticate, async (req, res) => {
  try {
    const { step, data } = req.body
    if (step === undefined || !data) return res.status(400).json({ error: 'Step and data are required.' })
    await pool.query(
      `INSERT INTO assessment_progress (user_id, step, data, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET step = $2, data = $3, updated_at = NOW()`,
      [req.user.id, step, JSON.stringify(data)]
    )
    res.json({ success: true })
  } catch (err) {
    console.error('Save progress error:', err)
    res.status(500).json({ error: 'Server error saving progress.' })
  }
})

app.delete('/api/assessment/progress', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM assessment_progress WHERE user_id = $1', [req.user.id])
    res.json({ success: true })
  } catch (err) {
    console.error('Delete progress error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Check last assessment (for retake cooldown) ----
app.get('/api/assessments/last', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT created_at FROM assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    )
    if (result.rows.length === 0) return res.json({ lastAssessment: null })
    res.json({ lastAssessment: result.rows[0].created_at })
  } catch (err) {
    console.error('Last assessment error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

app.get('/api/admin/analytics/user-growth', authenticate, requireStaff, async (_, res) => {
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

app.get('/api/admin/analytics/program-popularity', authenticate, requireStaff, async (_, res) => {
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

app.get('/api/admin/analytics/holland-distribution', authenticate, requireStaff, async (_, res) => {
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

app.get('/api/admin/analytics/strand-distribution', authenticate, requireStaff, async (_, res) => {
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

app.get('/api/admin/users/export', authenticate, requireManager, async (_, res) => {
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

// ---- Export assessments CSV (admin only) ----
app.get('/api/admin/assessments/export', authenticate, requireManager, async (_, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.user_id, u.email, u.first_name, u.last_name, a.strand, a.gwa, a.holland_code, a.top_programs, a.created_at
      FROM assessments a
      JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
    `)
    const headers = 'ID,User ID,Email,First Name,Last Name,Strand,GWA,Holland Code,Top Programs,Created At'
    const rows = result.rows.map(r =>
      `"${r.id}","${r.user_id}","${r.email}","${r.first_name || ''}","${r.last_name || ''}","${r.strand}","${r.gwa}","${r.holland_code}","${r.top_programs}","${r.created_at?.toISOString?.() || r.created_at || ''}"`
    )
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=assessments.csv')
    res.send([headers, ...rows].join('\n'))
  } catch (err) {
    console.error('Export assessments error:', err)
    res.status(500).json({ error: 'Server error exporting assessments.' })
  }
})

// ---- Forgot password ----
app.post('/api/forgot-password', async (req, res) => {
  if (!checkSensitiveRateLimit(`forgot_pwd_${req.ip}`, 5, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' })
  }
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required.' })

    const result = await pool.query('SELECT id, email FROM users WHERE email = $1', [email.toLowerCase()])
    if (result.rows.length === 0) {
      return res.json({ success: true })
    }

    const user = result.rows[0]
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await pool.query(
      'INSERT INTO password_resets (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
      [Date.now().toString(36) + Math.random().toString(36).slice(2, 8), user.id, token, expiresAt]
    )

    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`
    await sendEmail({
      to: user.email,
      subject: 'Reset Your Password — DOrSU Recommender',
      html: `<div style="font-family:sans-serif;max-width:500px">
        <h2 style="color:#1e3a5f">Password Reset</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;margin:16px 0">Reset Password</a>
        <p style="color:#64748b;font-size:13px">If you did not request this, please ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0"/>
        <p style="font-size:12px;color:#94a3b8">DOrSU Program Recommender System</p>
      </div>`,
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Verify reset token ----
app.get('/api/reset-password/verify', async (req, res) => {
  try {
    const { token } = req.query
    if (!token) return res.status(400).json({ error: 'Token is required.' })

    const result = await pool.query(
      'SELECT id, user_id FROM password_resets WHERE token = $1 AND used = false AND expires_at > NOW()',
      [token]
    )
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' })
    }
    res.json({ valid: true })
  } catch (err) {
    console.error('Verify token error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Reset password ----
app.post('/api/reset-password', async (req, res) => {
  if (!checkSensitiveRateLimit(`reset_pwd_${req.ip}`, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' })
  }
  try {
    const { token, password } = req.body
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required.' })
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' })

    const result = await pool.query(
      'SELECT id, user_id FROM password_resets WHERE token = $1 AND used = false AND expires_at > NOW()',
      [token]
    )
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' })
    }

    const reset = result.rows[0]
    const hashed = await bcrypt.hash(password, SALT_ROUNDS)
    await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashed, reset.user_id])
    await pool.query('UPDATE password_resets SET used = true WHERE id = $1', [reset.id])

    logActivity(reset.user_id, 'password_reset', 'Password reset via email', req.ip || '')
    res.json({ success: true })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Verify email ----
app.get('/api/verify-email', async (req, res) => {
  if (!checkSensitiveRateLimit(`verify_email_${req.ip}`, 20, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' })
  }
  try {
    const { token } = req.query
    if (!token) return res.status(400).json({ error: 'Token is required.' })

    const result = await pool.query(
      'SELECT id, user_id FROM email_verifications WHERE token = $1 AND expires_at > NOW()',
      [token]
    )
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification link.' })
    }

    const verif = result.rows[0]
    await pool.query('UPDATE users SET email_verified = true WHERE id = $1', [verif.user_id])
    await pool.query('DELETE FROM email_verifications WHERE id = $1', [verif.id])
    logActivity(verif.user_id, 'email_verified', 'Email verified', req.ip || '')

    res.json({ success: true })
  } catch (err) {
    console.error('Verify email error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Resend verification email ----
app.post('/api/resend-verification', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, first_name, email_verified FROM users WHERE id = $1', [req.user.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' })
    const user = result.rows[0]
    if (user.email_verified) return res.json({ success: true, alreadyVerified: true })

    await pool.query('DELETE FROM email_verifications WHERE user_id = $1', [user.id])
    const verifToken = crypto.randomBytes(32).toString('hex')
    const verifExpires = new Date(Date.now() + 48 * 60 * 60 * 1000)
    await pool.query(
      'INSERT INTO email_verifications (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
      [Date.now().toString(36) + Math.random().toString(36).slice(2, 8), user.id, verifToken, verifExpires]
    )
    const verifUrl = `${req.protocol}://${req.get('host')}/verify-email?token=${verifToken}`
    sendEmail({
      to: user.email,
      subject: 'Verify Your Email — DOrSU Recommender',
      html: `<div style="font-family:sans-serif;max-width:500px">
        <h2 style="color:#1e3a5f">Verify Your Email</h2>
        <p>Hi ${user.first_name || 'Student'},</p>
        <p>Click the link below to verify your email address.</p>
        <a href="${verifUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;margin:16px 0">Verify Email</a>
        <hr style="border:none;border-top:1px solid #e2e8f0"/>
        <p style="font-size:12px;color:#94a3b8">DOrSU Program Recommender System</p>
      </div>`,
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Resend verification error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Get email verification status ----
app.get('/api/email-verified', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT email_verified FROM users WHERE id = $1', [req.user.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' })
    const smtpConfigured = !!(process.env.SMTP_HOST)
    res.json({ verified: result.rows[0].email_verified, smtpConfigured })
  } catch (err) {
    console.error('Email verified status error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Health check ----
app.get('/api/health', async (_, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'error', message: 'Database unavailable' })
  }
})

app.use(express.static(join(__dirname, 'dist')))

app.get('/{*path}', (_, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

// ---- Activity Log ----
app.get('/api/admin/activity', authenticate, requireManager, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 100))
    const offset = (page - 1) * limit

    const countResult = await pool.query('SELECT COUNT(*)::int AS cnt FROM activity_log')
    const total = countResult.rows[0].cnt

    const result = await pool.query(
      `SELECT a.id, a.user_id, a.action_type, a.details, a.ip_address, a.created_at,
              u.email, u.first_name, u.last_name
       FROM activity_log a
       LEFT JOIN users u ON u.id = a.user_id
       ORDER BY a.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    res.json({ entries: result.rows, total, page, limit })
  } catch (err) {
    console.error('Activity log fetch error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Toggle program active status ----
app.put('/api/admin/programs/:code/toggle', authenticate, requireManager, async (req, res) => {
  try {
    const { code } = req.params
    const existing = await pool.query('SELECT * FROM program_settings WHERE code = $1', [code])
    if (existing.rows.length === 0) {
      await pool.query(
        'INSERT INTO program_settings (code, active) VALUES ($1, false)',
        [code]
      )
      logActivity(req.user.id, 'program_toggle', `Disabled program: ${code}`, req.ip || '')
      return res.json({ code, active: false })
    }
    const newActive = !existing.rows[0].active
    await pool.query(
      'UPDATE program_settings SET active = $1, updated_at = NOW() WHERE code = $2',
      [newActive, code]
    )
    logActivity(req.user.id, 'program_toggle', `${newActive ? 'Enabled' : 'Disabled'} program: ${code}`, req.ip || '')
    res.json({ code, active: newActive })
  } catch (err) {
    console.error('Program toggle error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Create program (admin only) ----
app.post('/api/admin/programs', authenticate, requireManager, async (req, res) => {
  try {
    const { code, name, college, description, strand, subjects, hollandCodes, careers, admissionChance } = req.body
    if (!code || !name) return res.status(400).json({ error: 'Code and name are required.' })

    if (programs.some(p => p.code === code)) {
      return res.status(409).json({ error: 'Program with this code already exists.' })
    }

    programs.push({
      code, name, college: college || '', description: description || '',
      strand: strand || [], subjects: subjects || [],
      hollandCodes: hollandCodes || [], careers: careers || [],
      admissionChance: admissionChance || 'Moderate',
    })
    writeFileSync(join(__dirname, 'src/data/programs.json'), JSON.stringify(programs, null, 2))
    await pool.query('INSERT INTO program_settings (code, active) VALUES ($1, true) ON CONFLICT DO NOTHING', [code])

    logActivity(req.user.id, 'program_create', `Created program: ${code}`, req.ip || '')
    res.json({ success: true })
  } catch (err) {
    console.error('Create program error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Update program (admin only) ----
app.put('/api/admin/programs/:code', authenticate, requireManager, async (req, res) => {
  try {
    const idx = programs.findIndex(p => p.code === req.params.code)
    if (idx === -1) return res.status(404).json({ error: 'Program not found.' })

    const updates = req.body
    for (const key of Object.keys(updates)) {
      if (key !== 'code') programs[idx][key] = updates[key]
    }
    writeFileSync(join(__dirname, 'src/data/programs.json'), JSON.stringify(programs, null, 2))

    logActivity(req.user.id, 'program_update', `Updated program: ${req.params.code}`, req.ip || '')
    res.json({ success: true })
  } catch (err) {
    console.error('Update program error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Delete program (admin only) ----
app.delete('/api/admin/programs/:code', authenticate, requireManager, async (req, res) => {
  try {
    const idx = programs.findIndex(p => p.code === req.params.code)
    if (idx === -1) return res.status(404).json({ error: 'Program not found.' })

    programs.splice(idx, 1)
    writeFileSync(join(__dirname, 'src/data/programs.json'), JSON.stringify(programs, null, 2))
    await pool.query('DELETE FROM program_settings WHERE code = $1', [req.params.code])

    logActivity(req.user.id, 'program_delete', `Deleted program: ${req.params.code}`, req.ip || '')
    res.json({ success: true })
  } catch (err) {
    console.error('Delete program error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

// ---- Get program active statuses ----
app.get('/api/programs/status', authenticate, async (_, res) => {
  try {
    const result = await pool.query('SELECT code, active FROM program_settings')
    const map = {}
    for (const row of result.rows) {
      map[row.code] = row.active
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
    if (['admin', 'super_admin', 'department_head'].includes(req.user.role)) {
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
app.put('/api/admin/settings', authenticate, requireManager, async (req, res) => {
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
    notifySettingsChanged(req.user.email, Object.keys(settings))
    res.json({ success: true })
  } catch (err) {
    console.error('Settings update error:', err)
    res.status(500).json({ error: 'Server error.' })
  }
})

const programs = JSON.parse(readFileSync(join(__dirname, 'src/data/programs.json'), 'utf-8'))

// ---- Sentry error handler ----
if (process.env.SENTRY_DSN) {
  app.use(Sentry.expressErrorHandler())
}

initDB().then(async () => {
  const ADMIN_EMAIL = 'admin@dorsu.edu.ph'
  const existing = await pool.query('SELECT id, role FROM users WHERE email = $1', [ADMIN_EMAIL])
  if (existing.rows.length === 0) {
    const adminPwd = 'Admin' + Math.random().toString(36).slice(2, 6).toUpperCase()
    const hashed = await bcrypt.hash(adminPwd, SALT_ROUNDS)
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
    await pool.query(
      `INSERT INTO users (id, email, first_name, last_name, password, avatar, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, '', 'super_admin', NOW(), NOW())`,
      [id, ADMIN_EMAIL, 'Admin', 'User', hashed]
    )
    console.log('')
    console.log('=== DEFAULT SUPER ADMIN ACCOUNT ===')
    console.log(`   Email:    ${ADMIN_EMAIL}`)
    console.log(`   Password: ${adminPwd}`)
    console.log('===================================')
    console.log('')
  } else if (existing.rows[0].role !== 'super_admin') {
    await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['super_admin', ADMIN_EMAIL])
    console.log(`Upgraded ${ADMIN_EMAIL} to super_admin.`)
  }

  // Auto-populate program_settings with all programs enabled by default
  const progCount = await pool.query('SELECT COUNT(*)::int AS cnt FROM program_settings')
  if (progCount.rows[0].cnt === 0) {
    for (const prog of programs) {
      await pool.query(
        'INSERT INTO program_settings (code, active) VALUES ($1, true) ON CONFLICT DO NOTHING',
        [prog.code]
      )
    }
    console.log(`Auto-populated ${programs.length} program settings.`)
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  }
}).catch(err => {
  if (!process.env.VERCEL) {
    console.error('Failed to initialize database:', err)
    process.exit(1)
  }
})

export default app
