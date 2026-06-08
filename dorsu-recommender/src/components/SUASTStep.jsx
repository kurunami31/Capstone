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
    backgroundColor: 'var(--track-bg)', border: '1px solid var(--border-strong)',
    color: 'var(--text-primary)', outline: 'none',
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8, color: 'var(--text-primary)' }}>SUAST Exam Tiers</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 4, fontSize: 14 }}>
        Estimate your performance on the DOrSU State University Aptitude and Scholarship Test (SUAST).
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
        If you haven't taken it yet, select "Not taken" — the system will use your grades instead.
      </p>

      <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
        {SUBTESTS.map(s => (
          <div key={s.key} className="stack-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label className="full-mobile" style={{ width: 160, fontWeight: 500, color: 'var(--label-color)' }}>{s.label}</label>
            <select value={tiers[s.key] || 'not_taken'} onChange={e => update(s.key, e.target.value)} style={selectStyle}>
              {TIERS.map(t => <option key={t.value} value={t.value} style={{ background: 'var(--modal-bg)', color: 'var(--text-primary)' }}>{t.label}</option>)}
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
          {TIERS.map(t => <option key={t.value} value={t.value} style={{ background: 'var(--modal-bg)', color: 'var(--text-primary)' }}>{t.label}</option>)}
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
  backgroundColor: 'var(--card-bg)', color: 'var(--text-secondary)',
  border: '1px solid var(--border-strong)', borderRadius: 10, cursor: 'pointer',
  transition: 'all 0.2s',
}
