import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'dorsu-recommender-secret-change-in-production'
const SALT_ROUNDS = 12
const TOKEN_EXPIRY = '1h'
const USERS_FILE = join(__dirname, 'data', 'users.json')

if (!existsSync(join(__dirname, 'data'))) {
  mkdirSync(join(__dirname, 'data'), { recursive: true })
}
if (!existsSync(USERS_FILE)) {
  writeFileSync(USERS_FILE, '[]', 'utf-8')
}

function readUsers() {
  try {
    return JSON.parse(readFileSync(USERS_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeUsers(users) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

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

app.use(express.json())
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
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
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

app.post('/api/register', rateLimit, (req, res) => {
  const { email, password, name } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' })
  }
  if (name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters.' })
  }

  const users = readUsers()
  if (users.find(u => u.email === email.toLowerCase())) {
    return res.status(409).json({ error: 'An account with this email already exists.' })
  }

  const hashed = bcrypt.hashSync(password, SALT_ROUNDS)
  const user = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    email: email.toLowerCase(),
    name: name.trim(),
    password: hashed,
    createdAt: new Date().toISOString(),
  }
  users.push(user)
  writeUsers(users)

  const token = generateToken(user)
  setTokenCookie(res, token)
  res.json({ user: { id: user.id, email: user.email, name: user.name } })
})

app.post('/api/login', rateLimit, (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const users = readUsers()
  const user = users.find(u => u.email === email.toLowerCase())
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const token = generateToken(user)
  setTokenCookie(res, token)
  res.json({ user: { id: user.id, email: user.email, name: user.name } })
})

app.post('/api/logout', (_, res) => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' })
  res.json({ success: true })
})

app.get('/api/me', authenticate, (req, res) => {
  res.json({ user: req.user })
})

app.use(express.static(join(__dirname, 'dist')))

app.get('/{*path}', (_, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
