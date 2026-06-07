import 'dotenv/config'
import { execSync } from 'child_process'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BACKUP_DIR = join(__dirname, '..', 'backups')

if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true })

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const filename = join(BACKUP_DIR, `dorsu-backup-${timestamp}.sql`)

try {
  execSync(`pg_dump "${dbUrl}" --no-owner --no-acl -f "${filename}"`, { stdio: 'pipe' })
  console.log(`Backup saved: ${filename}`)
} catch (err) {
  console.error('Backup failed:', err.message)
  process.exit(1)
}
