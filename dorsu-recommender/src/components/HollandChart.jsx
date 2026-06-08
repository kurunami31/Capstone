const LABELS = {
  R: 'Realistic', I: 'Investigative', A: 'Artistic',
  S: 'Social', E: 'Enterprising', C: 'Conventional',
}

const COLORS = {
  R: '#3b82f6', I: '#8b5cf6', A: '#ec4899',
  S: '#f59e0b', E: '#10b981', C: '#06b6d4',
}

export default function HollandChart({ scores }) {
  if (!scores || Object.keys(scores).length === 0) return null

  const maxScore = Math.max(...Object.values(scores), 100)

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 10 }}>
        Holland Personality Profile
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Object.entries(LABELS).map(([code, label]) => {
          const score = scores[code] || 0
          const pct = Math.round((score / maxScore) * 100)
          return (
            <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                backgroundColor: COLORS[code], display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#fff',
              }}>
                {code}
              </div>
              <div style={{ width: 60, fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>
                {label}
              </div>
              <div style={{
                flex: 1, height: 8, borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden',
              }}>
                <div style={{
                  width: `${pct}%`, height: '100%', borderRadius: 4,
                  backgroundColor: COLORS[code],
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ width: 32, textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#f1f5f9' }}>
                {score}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
