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

    const result = await pool.query(
      `INSERT INTO users (id, email, first_name, last_name, middle_initial, extension_name, password, avatar, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, '', NOW(), NOW())
       RETURNING id, email, first_name, last_name, middle_initial, extension_name, avatar, created_at, updated_at`,
      [id, lowerEmail, firstName.trim(), lastName.trim(), middleInitial?.trim() || '', extensionName?.trim() || '', hashed]
    )

    const row = result.rows[0]
    const user = {
      id: row.id, email: row.email, avatar: row.avatar,
      firstName: row.first_name, lastName: row.last_name,
      middleInitial: row.middle_initial, extensionName: row.extension_name,
      name: [row.first_name, row.last_name].filter(Boolean).join(' '),
      createdAt: row.created_at, updatedAt: row.updated_at,
    }
    const token = generateToken(user)
    setTokenCookie(res, token)
    res.json({ user })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Server error during registration.' })
  }
})

function mapUser(row) {
  return {
    id: row.id, email: row.email, avatar: row.avatar,
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

    const result = await pool.query(
      'SELECT id, email, first_name, last_name, middle_initial, extension_name, password, avatar, created_at, updated_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    const row = result.rows[0]
    if (!row || !bcrypt.compareSync(password, row.password)) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const { password: _, ...safe } = row
    const user = mapUser(row)
    const token = generateToken(user)
    setTokenCookie(res, token)
    res.json({ user })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error during login.' })
  }
})

app.post('/api/logout', (_, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' })
  res.json({ success: true })
})

app.get('/api/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, middle_initial, extension_name, avatar, created_at, updated_at FROM users WHERE id = $1',
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
        'SELECT id, email, first_name, last_name, middle_initial, extension_name, avatar, created_at, updated_at FROM users WHERE id = $1',
        [req.user.id]
      )
      return res.json({ user: mapUser(current.rows[0]) })
    }

    updates.push(`updated_at = NOW()`)
    values.push(req.user.id)

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING id, email, first_name, last_name, middle_initial, extension_name, avatar, created_at, updated_at`,
      values
    )

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

Keep answers concise, friendly, and helpful. If you don't know something, say so honestly. Do not make up information about specific program details you are not sure about. When asked about technical issues, suggest contacting the system administrator.`

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

    const reply = result.text || 'Sorry, I could not generate a response.'
    res.json({ reply })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ error: 'Failed to get AI response.' })
  }
})

app.use(express.static(join(__dirname, 'dist')))

app.get('/{*path}', (_, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch(err => {
  console.error('Failed to initialize database:', err)
  process.exit(1)
})
