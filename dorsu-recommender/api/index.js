import app, { dbInit } from '../server.js'

export default async function handler(req, res) {
  try {
    await dbInit
  } catch (err) {
    console.error('DB init error:', err?.message || err)
    res.status(500).json({ error: 'Database initialization failed.', detail: err?.message })
    return
  }
  return app(req, res)
}
