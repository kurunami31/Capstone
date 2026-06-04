const SUBTESTS = [
  { key: 'general_ability', label: 'General Ability' },
  { key: 'numerical_aptitude', label: 'Numerical Aptitude' },
  { key: 'verbal_aptitude', label: 'Verbal Aptitude' },
  { key: 'spatial_aptitude', label: 'Spatial Aptitude' },
  { key: 'perceptual_aptitude', label: 'Perceptual Aptitude' },
  { key: 'manual_dexterity', label: 'Manual Dexterity' },
]

const TIERS = [
  { value: 'very_high', label: 'Very High (> 160)' },
  { value: 'high', label: 'High (145–160)' },
  { value: 'moderate', label: 'Moderate (130–144)' },
  { value: 'low', label: 'Low (< 130)' },
  { value: 'not_taken', label: "Not taken / Don't know" },
]

export default function SUASTStep({ data, onUpdate, onNext, onBack }) {
  const tiers = data.suastTiers || {}

  const update = (key, val) => {
    onUpdate({ suastTiers: { ...tiers, [key]: val } })
  }

  const selectStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#f1f5f9', outline: 'none',
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8, color: '#f1f5f9' }}>SUAST Exam Tiers</h2>
      <p style={{ color: '#94a3b8', marginBottom: 4, fontSize: 14 }}>
        Estimate your performance on the DOrSU State University Aptitude and Scholarship Test (SUAST).
      </p>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
        If you haven't taken it yet, select "Not taken" — the system will use your grades instead.
      </p>

      <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
        {SUBTESTS.map(s => (
          <div key={s.key} className="stack-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label className="full-mobile" style={{ width: 160, fontWeight: 500, color: '#cbd5e1' }}>{s.label}</label>
            <select value={tiers[s.key] || 'not_taken'} onChange={e => update(s.key, e.target.value)} style={selectStyle}>
              {TIERS.map(t => <option key={t.value} value={t.value} style={{ background: '#1e293b', color: '#f1f5f9' }}>{t.label}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div style={{
        padding: '16px', backgroundColor: 'rgba(251,191,36,0.05)',
        border: '1px solid rgba(251,191,36,0.15)', borderRadius: 8, marginBottom: 20,
      }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: 6, color: '#fbbf24', fontSize: 14 }}>Overall Composite Tier</label>
        <select value={tiers.overall || 'not_taken'} onChange={e => update('overall', e.target.value)} style={selectStyle}>
          {TIERS.map(t => <option key={t.value} value={t.value} style={{ background: '#1e293b', color: '#f1f5f9' }}>{t.label}</option>)}
        </select>
      </div>

      <div className="stack-mobile" style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} style={{ ...secondaryBtn, width: '100%' }}>Back</button>
        <button onClick={onNext} style={{ ...primaryBtn, width: '100%' }}>Next</button>
      </div>
    </div>
  )
}

const primaryBtn = {
  padding: '12px 40px', fontSize: 15, fontWeight: 600,
  backgroundColor: '#2563eb', color: '#fff',
  border: 'none', borderRadius: 10, cursor: 'pointer',
  transition: 'all 0.2s',
}

const secondaryBtn = {
  padding: '12px 40px', fontSize: 15, fontWeight: 600,
  backgroundColor: 'rgba(255,255,255,0.04)', color: '#94a3b8',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, cursor: 'pointer',
  transition: 'all 0.2s',
}
