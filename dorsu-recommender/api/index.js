import app, { dbInit } from '../server.js'

export default async function handler(req, res) {
  try {
    await dbInit
  } catch {
    res.status(500).json({ error: 'Database initialization failed.' })
    return
  }
  return app(req, res)
}
