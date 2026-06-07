const STRANDS = [
  { value: 'STEM', label: 'STEM', desc: 'Science, Technology, Engineering, and Mathematics' },
  { value: 'ABM', label: 'ABM', desc: 'Accountancy, Business, and Management' },
  { value: 'HUMSS', label: 'HUMSS', desc: 'Humanities and Social Sciences' },
  { value: 'GAS', label: 'GAS', desc: 'General Academic Strand' },
  { value: 'TVL', label: 'TVL', desc: 'Technical-Vocational-Livelihood' },
  { value: 'SPORTS', label: 'Sports', desc: 'Sports Track' },
  { value: 'ARTS', label: 'Arts & Design', desc: 'Arts and Design Track' },
]

export default function StrandStep({ data, onUpdate, onNext, onBack }) {
  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8, color: '#f1f5f9' }}>SHS Strand</h2>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>Select the SHS strand you are currently enrolled in or completed.</p>
      <div style={{ display: 'grid', gap: 10 }}>
        {STRANDS.map(s => (
          <label
            key={s.value}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
              border: `2px solid ${data.strand === s.value ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 10, cursor: 'pointer',
              backgroundColor: data.strand === s.value ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.04)',
              transition: 'all 0.2s',
            }}
          >
            <input
              type="radio" name="strand" value={s.value}
              checked={data.strand === s.value}
              onChange={() => onUpdate({ strand: s.value })}
              style={{ accentColor: '#3b82f6' }}
            />
            <div>
              <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{s.label}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{s.desc}</div>
            </div>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              marginTop: 24, padding: '12px 30px', fontSize: 15, fontWeight: 600,
              backgroundColor: 'transparent', color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, cursor: 'pointer',
            }}
          >
            Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!data.strand}
          style={btnStyle(data.strand)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

function btnStyle(ready) {
  return {
    marginTop: 24, padding: '12px 40px', fontSize: 15, fontWeight: 600,
    backgroundColor: ready ? '#2563eb' : 'rgba(255,255,255,0.1)', color: '#fff',
    border: 'none', borderRadius: 10, cursor: ready ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s',
  }
}
