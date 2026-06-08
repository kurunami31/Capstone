import { useState, useEffect } from 'react'

const CORE = ['math', 'science', 'english', 'filipino']
const STRAND_SPECIFIC = {
  STEM: ['calculus', 'biology', 'chemistry', 'physics'],
  ABM: ['accounting', 'business_math', 'economics'],
  HUMSS: ['philosophy', 'social_science', 'english_advanced'],
  GAS: ['general_math', 'english', 'science'],
  TVL: ['specialization_1', 'specialization_2'],
  SPORTS: ['sports_science', 'physical_education'],
  ARTS: ['art_history', 'design_basics', 'creative_works'],
}

export default function GradesStep({ data, onUpdate, onNext, onBack }) {
  const strand = data.strand || 'GAS'
  const strandSubs = STRAND_SPECIFIC[strand] || STRAND_SPECIFIC.GAS
  const [grades, setGrades] = useState(data.grades || {})
  const [strandGrades, setStrandGrades] = useState(data.strandSpecificGrades || {})

  const updateGrade = (subj, val) => {
    const n = val === '' ? '' : Math.min(100, Math.max(0, Number(val)))
    setGrades(g => ({ ...g, [subj]: n }))
  }
  const updateStrandGrade = (subj, val) => {
    const n = val === '' ? '' : Math.min(100, Math.max(0, Number(val)))
    setStrandGrades(g => ({ ...g, [subj]: n }))
  }

  const allFilled = CORE.every(s => grades[s] && grades[s] !== '')
  const gwa = allFilled
    ? Math.round(CORE.reduce((sum, s) => sum + Number(grades[s]), 0) / CORE.length)
    : 0

  useEffect(() => {
    if (allFilled) {
      onUpdate({ grades, strandSpecificGrades: strandGrades, gwa })
    }
  }, [grades, strandGrades])

  const inpStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14,
    backgroundColor: 'var(--track-bg)', border: '1px solid var(--border-strong)',
    color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8, color: 'var(--text-primary)' }}>SHS Grades</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
        Enter your final grades for Grade 11 and Grade 12 (or current).
      </p>

      <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--label-color)' }}>Core Subjects</h3>
      <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
        {CORE.map(s => (
          <div key={s} className="stack-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label className="full-mobile" style={{ width: 140, fontWeight: 500, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{s}</label>
            <input
              type="number" min="0" max="100" value={grades[s] ?? ''}
              onChange={e => updateGrade(s, e.target.value)}
              style={inpStyle}
              placeholder="0–100"
            />
          </div>
        ))}
      </div>

      {allFilled && (
        <div style={{
          padding: '12px 16px', backgroundColor: 'rgba(5,150,105,0.1)',
          border: '1px solid rgba(5,150,105,0.2)', borderRadius: 8,
          marginBottom: 24, color: '#6ee7b7', fontSize: 14,
        }}>
          <strong>GWA: {gwa}</strong> / 100
        </div>
      )}

      <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--label-color)' }}>Strand-Specific Subjects ({strand})</h3>
      <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
        {strandSubs.map(s => (
          <div key={s} className="stack-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label className="full-mobile" style={{ width: 140, fontWeight: 500, textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{s.replace(/_/g, ' ')}</label>
            <input
              type="number" min="0" max="100" value={strandGrades[s] ?? ''}
              onChange={e => updateStrandGrade(s, e.target.value)}
              style={inpStyle}
              placeholder="0–100"
            />
          </div>
        ))}
      </div>

      <div className="stack-mobile" style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} style={{ ...secondaryBtn, width: '100%' }}>Back</button>
        <button onClick={onNext} disabled={!allFilled} style={{ ...btnStyle(allFilled), width: '100%' }}>Next</button>
      </div>
    </div>
  )
}

function btnStyle(ready) {
  return {
    padding: '12px 40px', fontSize: 15, fontWeight: 600,
    backgroundColor: ready ? '#2563eb' : 'var(--border-strong)', color: '#fff',
    border: 'none', borderRadius: 10, cursor: ready ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s',
  }
}

const secondaryBtn = {
  padding: '12px 40px', fontSize: 15, fontWeight: 600,
  backgroundColor: 'var(--card-bg)', color: 'var(--text-secondary)',
  border: '1px solid var(--border-strong)', borderRadius: 10, cursor: 'pointer',
  transition: 'all 0.2s',
}
