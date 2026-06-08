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
      backgroundColor: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: 28,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
          Achievements
        </h2>
        <span style={{ fontSize: 12, color: '#64748b' }}>
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
              backgroundColor: a.earned ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${a.earned ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}`,
              color: a.earned ? '#34d399' : '#475569',
              opacity: a.earned ? 1 : 0.5,
              cursor: 'default',
            }}
          >
            <span>{a.icon}</span>
            <span style={{ fontWeight: a.earned ? 600 : 400 }}>{a.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
