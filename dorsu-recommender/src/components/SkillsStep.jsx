import { useState } from 'react'

const SKILLS = [
  { key: 'analytical', label: 'Analytical Thinking', desc: 'Breaking down complex problems, analyzing data' },
  { key: 'creative', label: 'Creativity', desc: 'Generating new ideas, thinking outside the box' },
  { key: 'social', label: 'Social & Interpersonal', desc: 'Working with people, communicating, empathy' },
  { key: 'technical', label: 'Technical Skills', desc: 'Using tools, technology, hands-on techniques' },
  { key: 'leadership', label: 'Leadership', desc: 'Leading teams, making decisions, motivating others' },
  { key: 'organizational', label: 'Organization', desc: 'Planning, attention to detail, record-keeping' },
]

export default function SkillsStep({ data, onUpdate, onNext, onBack }) {
  const [ratings, setRatings] = useState(data.skills || {})

  const setRating = (key, val) => {
    const updated = { ...ratings, [key]: val }
    setRatings(updated)
    onUpdate({ skills: updated })
  }

  const allRated = SKILLS.every(s => ratings[s.key])

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8, color: '#f1f5f9' }}>Self-Skills Assessment</h2>
      <p style={{ color: '#94a3b8', marginBottom: 20, fontSize: 14 }}>
        Rate your current skill level in each area from 1 (Beginner) to 5 (Expert).
      </p>

      <div style={{ display: 'grid', gap: 14 }}>
        {SKILLS.map(s => (
          <div key={s.key} style={{
            padding: '16px 20px', backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 2, color: '#f1f5f9' }}>{s.label}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>{s.desc}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => setRating(s.key, val)}
                  style={{
                    flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600,
                    border: `2px solid ${ratings[s.key] === val ? '#3b82f6' : 'rgba(255,255,255,0.15)'}`,
                    backgroundColor: ratings[s.key] === val ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                    color: ratings[s.key] === val ? '#60a5fa' : '#94a3b8',
                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569', marginTop: 4 }}>
              <span>Beginner</span>
              <span>Expert</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={onBack} style={secondaryBtn}>Back</button>
        <button onClick={onNext} disabled={!allRated} style={btnStyle(allRated)}>
          See My Results
        </button>
      </div>
    </div>
  )
}

function btnStyle(ready) {
  return {
    padding: '12px 40px', fontSize: 15, fontWeight: 600,
    backgroundColor: ready ? '#059669' : 'rgba(255,255,255,0.1)', color: '#fff',
    border: 'none', borderRadius: 10, cursor: ready ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s',
  }
}

const secondaryBtn = {
  padding: '12px 40px', fontSize: 15, fontWeight: 600,
  backgroundColor: 'rgba(255,255,255,0.04)', color: '#94a3b8',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, cursor: 'pointer',
  transition: 'all 0.2s',
}
