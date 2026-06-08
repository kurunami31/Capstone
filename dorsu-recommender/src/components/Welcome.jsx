import { useState } from 'react'

export default function Welcome({ onStart, onBack }) {
  const [school, setSchool] = useState('')

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 4, color: 'var(--text-primary)' }}>Welcome!</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
        Enter your school to begin the assessment.
      </p>

      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: 'var(--label-color)' }}>
            School (optional)
          </label>
          <input
            value={school}
            onChange={e => setSchool(e.target.value)}
            placeholder="Your SHS school name"
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 8, fontSize: 14,
              backgroundColor: 'var(--track-bg)', border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={() => onStart(school)}
          style={{
            width: '100%', padding: '14px 0', fontSize: 16, fontWeight: 700,
            backgroundColor: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Start Assessment
        </button>

        {onBack && (
          <button
            onClick={onBack}
            style={{
              width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 600,
              backgroundColor: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid var(--border-strong)', borderRadius: 10, cursor: 'pointer',
              marginTop: 8,
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
