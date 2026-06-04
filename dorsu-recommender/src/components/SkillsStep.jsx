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
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Self-Skills Assessment</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>
        Rate your current skill level in each area from 1 (Beginner) to 5 (Expert).
      </p>

      <div style={{ display: 'grid', gap: 14 }}>
        {SKILLS.map(s => (
          <div key={s.key} style={{
            padding: '14px 18px', backgroundColor: '#f8f9fa', borderRadius: 8
          }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>{s.desc}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => setRating(s.key, val)}
                  style={{
                    flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600,
                    border: `2px solid ${ratings[s.key] === val ? '#1a56db' : '#ddd'}`,
                    backgroundColor: ratings[s.key] === val ? '#eef4ff' : '#fff',
                    borderRadius: 6, cursor: 'pointer'
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginTop: 2 }}>
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
    backgroundColor: ready ? '#059669' : '#aaa', color: '#fff',
    border: 'none', borderRadius: 8, cursor: ready ? 'pointer' : 'not-allowed'
  }
}

const secondaryBtn = {
  padding: '12px 40px', fontSize: 15, fontWeight: 600,
  backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: 8, cursor: 'pointer'
}
