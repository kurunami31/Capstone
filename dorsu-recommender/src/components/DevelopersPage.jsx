import { useTranslation } from '../hooks/useTranslation.js'

const DEV_IMG = '/developers/'

const developers = [
  {
    name: 'Christopher Lyod B. Mercado',
    photo: `${DEV_IMG}Christopher.jpg`,
    role: 'Lead Developer & Project Manager',
    description:
      'Overall project developer and capstone leader. Christopher architected the full-stack system, built the assessment engine and recommendation scoring algorithm, and led the end-to-end integration of frontend, backend, and database. He managed sprint planning, code reviews, version control, and deployment — ensuring the team delivered a functional, production-ready application on schedule.',
  },
  {
    name: 'Kenth Justine B. Sumalinab',
    photo: `${DEV_IMG}Kenth.jpg`,
    role: 'Frontend & Backend Developer',
    description:
      'Assistant developer contributing across both frontend and backend. Kenth implemented the admin panel with user management, program CRUD, assessment question customization, and the analytics dashboard. He designed and optimized database queries, built API endpoints, and helped debug cross-cutting issues, significantly improving the system\'s performance and reliability.',
  },
  {
    name: 'Maria Stefanie Celine A. Dela Salde',
    photo: `${DEV_IMG}Maria.jpg`,
    role: 'UI/UX Designer & QA Lead',
    description:
      'UI/UX designer, testing and documentation lead. Maria designed the entire user interface, user flow, and visual identity — crafting a clean, intuitive experience for students, counselors, and administrators alike. She conducted usability testing, wrote comprehensive test cases, documented system features and architecture, and ensured the application met quality standards before each release.',
  },
]

export default function DevelopersPage() {
  const { t } = useTranslation()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--gradient-start, #0f172a) 0%, var(--gradient-mid, #1e3a5f) 50%, var(--gradient-end, #0f172a) 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '40px 20px 80px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(59,130,246,0.1)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary, #f1f5f9)', margin: '0 0 8px' }}>
            About the Developers
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary, #94a3b8)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            This capstone project was built by three 3rd-year BSIT students at Davao Oriental State University.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {developers.map((dev, i) => (
            <div
              key={dev.name}
              style={{
                backgroundColor: 'var(--bg-card, rgba(255,255,255,0.04))',
                border: '1px solid var(--border-color, rgba(255,255,255,0.06))',
                borderRadius: 20,
                padding: 32,
                backdropFilter: 'blur(8px)',
                animation: 'fadeInUp 0.5s ease-out both',
                animationDelay: `${i * 0.15}s`,
              }}
            >
              <div style={{
                width: 96, height: 96, borderRadius: '50%',
                overflow: 'hidden', margin: '0 auto 16px',
                border: '3px solid rgba(59,130,246,0.3)',
              }}>
                <img
                  src={dev.photo}
                  alt={dev.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.style.background = 'linear-gradient(135deg, #1e40af, #3b82f6)'
                  }}
                />
              </div>
              <h3 style={{
                fontSize: 18, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)',
                margin: '0 0 4px', textAlign: 'center',
              }}>
                {dev.name}
              </h3>
              <p style={{
                fontSize: 13, fontWeight: 600, color: '#60a5fa',
                margin: '0 0 16px', textAlign: 'center',
                letterSpacing: '0.01em',
              }}>
                {dev.role}
              </p>
              <p style={{
                fontSize: 14, color: 'var(--text-secondary, #94a3b8)',
                lineHeight: 1.7, margin: 0,
              }}>
                {dev.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
