import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation.js'
import { secondaryBtn, btnStyle } from '../styles/shared.js'

const SKILLS = [
  { key: 'analytical', label: 'Analytical Thinking', desc: 'Breaking down complex problems, analyzing data' },
  { key: 'creative', label: 'Creativity', desc: 'Generating new ideas, thinking outside the box' },
  { key: 'social', label: 'Social & Interpersonal', desc: 'Working with people, communicating, empathy' },
  { key: 'technical', label: 'Technical Skills', desc: 'Using tools, technology, hands-on techniques' },
  { key: 'leadership', label: 'Leadership', desc: 'Leading teams, making decisions, motivating others' },
  { key: 'organizational', label: 'Organization', desc: 'Planning, attention to detail, record-keeping' },
]

export default function SkillsStep({ data, onUpdate, onNext, onBack }) {
  const { t } = useTranslation()
  const [ratings, setRatings] = useState(data.skills || {})

  const setRating = (key, val) => {
    const updated = { ...ratings, [key]: val }
    setRatings(updated)
    onUpdate({ skills: updated })
  }

  const allRated = SKILLS.every(s => ratings[s.key])

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8, color: 'var(--text-primary)' }}>{t('skills.title')}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
        {t('skills.rate')}
      </p>

      <div style={{ display: 'grid', gap: 14 }}>
        {SKILLS.map(s => (
          <div key={s.key} style={{
            padding: '16px 20px', backgroundColor: 'var(--card-bg)',
            borderRadius: 10, border: '1px solid var(--track-bg)',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 2, color: 'var(--text-primary)' }}>{s.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>{s.desc}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => setRating(s.key, val)}
                  style={{
                    flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 600,
                    border: `2px solid ${ratings[s.key] === val ? '#3b82f6' : 'rgba(255,255,255,0.15)'}`,
                    backgroundColor: ratings[s.key] === val ? 'var(--accent-bg)' : 'var(--card-bg)',
                    color: ratings[s.key] === val ? 'var(--accent-text)' : 'var(--text-secondary)',
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

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={() => { setRatings({}); onUpdate({ skills: {} }) }} style={{
          ...secondaryBtn, fontSize: 13, padding: '8px 16px',
        }}>
          Clear All
        </button>
      </div>

      <div className="stack-mobile" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={onBack} style={{ ...secondaryBtn, width: '100%' }}>Back</button>
        <button onClick={onNext} disabled={!allRated} style={{ ...btnStyle(allRated), width: '100%' }}>
          See My Results
        </button>
      </div>
      {!allRated && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
          Rate all skills to continue
        </p>
      )}
    </div>
  )
}
