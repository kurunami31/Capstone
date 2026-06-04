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

  const inpStyle = { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14 }

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>SHS Grades</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>Enter your final grades for Grade 11 and Grade 12 (or current).</p>

      <h3 style={{ fontSize: 16, marginBottom: 12 }}>Core Subjects</h3>
      <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
        {CORE.map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ width: 140, fontWeight: 500, textTransform: 'capitalize' }}>{s}</label>
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
        <div style={{ padding: '12px 16px', backgroundColor: '#e8f5e9', borderRadius: 8, marginBottom: 24 }}>
          <strong>GWA: {gwa}</strong> / 100
        </div>
      )}

      <h3 style={{ fontSize: 16, marginBottom: 12 }}>Strand-Specific Subjects ({strand})</h3>
      <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
        {strandSubs.map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ width: 140, fontWeight: 500, textTransform: 'capitalize' }}>{s.replace(/_/g, ' ')}</label>
            <input
              type="number" min="0" max="100" value={strandGrades[s] ?? ''}
              onChange={e => updateStrandGrade(s, e.target.value)}
              style={inpStyle}
              placeholder="0–100"
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} style={secondaryBtn}>Back</button>
        <button onClick={onNext} disabled={!allFilled} style={btnStyle(allFilled)}>Next</button>
      </div>
    </div>
  )
}

function btnStyle(ready) {
  return {
    padding: '12px 40px', fontSize: 15, fontWeight: 600,
    backgroundColor: ready ? '#1a56db' : '#aaa', color: '#fff',
    border: 'none', borderRadius: 8, cursor: ready ? 'pointer' : 'not-allowed'
  }
}

function secondaryBtn() {
  return {
    padding: '12px 40px', fontSize: 15, fontWeight: 600,
    backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: 8, cursor: 'pointer'
  }
}
