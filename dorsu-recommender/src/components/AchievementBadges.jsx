import { useState, useEffect } from 'react'

export default function AchievementBadges() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/achievements', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setAchievements(d.achievements || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null
  if (achievements.length === 0) return null

  const earned = achievements.filter(a => a.earned).length

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
      borderRadius: 20, padding: 28,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Achievements
        </h2>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {earned}/{achievements.length}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {achievements.map(a => (
          <div
            key={a.key}
            title={a.description}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 20, fontSize: 13,
              backgroundColor: a.earned ? 'rgba(52,211,153,0.1)' : 'var(--row-bg)',
              border: `1px solid ${a.earned ? 'rgba(52,211,153,0.2)' : 'var(--track-bg)'}`,
              color: a.earned ? '#34d399' : '#475569',
              opacity: a.earned ? 1 : 0.5,
              cursor: 'default',
            }}
          >
            <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {a.key === 'first_assessment' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              ) : a.key === 'explorer' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                </svg>
              ) : a.key === 'scholar' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
              ) : a.key === 'committed' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              )}
            </span>
            <span style={{ fontWeight: a.earned ? 600 : 400 }}>{a.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
