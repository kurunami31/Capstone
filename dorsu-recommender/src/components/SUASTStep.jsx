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
  { value: 'not_taken', label: 'Not taken / Don\'t know' },
]

export default function SUASTStep({ data, onUpdate, onNext, onBack }) {
  const tiers = data.suastTiers || {}

  const update = (key, val) => {
    onUpdate({ suastTiers: { ...tiers, [key]: val } })
  }

  const selectStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc', fontSize: 14
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>SUAST Exam Tiers</h2>
      <p style={{ color: '#666', marginBottom: 4 }}>
        Estimate your performance on the DOrSU State University Aptitude and Scholarship Test (SUAST).
      </p>
      <p style={{ color: '#999', fontSize: 13, marginBottom: 20 }}>
        If you haven't taken it yet, select "Not taken" — the system will use your grades instead.
      </p>

      <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
        {SUBTESTS.map(s => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ width: 160, fontWeight: 500 }}>{s.label}</label>
            <select value={tiers[s.key] || 'not_taken'} onChange={e => update(s.key, e.target.value)} style={selectStyle}>
              {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px', backgroundColor: '#fff3e0', borderRadius: 8, marginBottom: 20 }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Overall Composite Tier</label>
        <select value={tiers.overall || 'not_taken'} onChange={e => update('overall', e.target.value)} style={selectStyle}>
          {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onBack} style={secondaryBtn}>Back</button>
        <button onClick={onNext} style={primaryBtn}>Next</button>
      </div>
    </div>
  )
}

const primaryBtn = {
  padding: '12px 40px', fontSize: 15, fontWeight: 600,
  backgroundColor: '#1a56db', color: '#fff',
  border: 'none', borderRadius: 8, cursor: 'pointer'
}

const secondaryBtn = {
  padding: '12px 40px', fontSize: 15, fontWeight: 600,
  backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: 8, cursor: 'pointer'
}
