const STRANDS = [
  { value: 'STEM', label: 'STEM', desc: 'Science, Technology, Engineering, and Mathematics' },
  { value: 'ABM', label: 'ABM', desc: 'Accountancy, Business, and Management' },
  { value: 'HUMSS', label: 'HUMSS', desc: 'Humanities and Social Sciences' },
  { value: 'GAS', label: 'GAS', desc: 'General Academic Strand' },
  { value: 'TVL', label: 'TVL', desc: 'Technical-Vocational-Livelihood' },
  { value: 'SPORTS', label: 'Sports', desc: 'Sports Track' },
  { value: 'ARTS', label: 'Arts & Design', desc: 'Arts and Design Track' },
]

export default function StrandStep({ data, onUpdate, onNext }) {
  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>SHS Strand</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>Select the SHS strand you are currently enrolled in or completed.</p>
      <div style={{ display: 'grid', gap: 10 }}>
        {STRANDS.map(s => (
          <label
            key={s.value}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              border: `2px solid ${data.strand === s.value ? '#1a56db' : '#ddd'}`,
              borderRadius: 8, cursor: 'pointer', backgroundColor: data.strand === s.value ? '#eef4ff' : '#fff'
            }}
          >
            <input
              type="radio" name="strand" value={s.value}
              checked={data.strand === s.value}
              onChange={() => onUpdate({ strand: s.value })}
              style={{ accentColor: '#1a56db' }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{s.desc}</div>
            </div>
          </label>
        ))}
      </div>
      <button
        onClick={onNext}
        disabled={!data.strand}
        style={btnStyle(data.strand)}
      >
        Next
      </button>
    </div>
  )
}

function btnStyle(ready) {
  return {
    marginTop: 24, padding: '12px 40px', fontSize: 15, fontWeight: 600,
    backgroundColor: ready ? '#1a56db' : '#aaa', color: '#fff',
    border: 'none', borderRadius: 8, cursor: ready ? 'pointer' : 'not-allowed'
  }
}
