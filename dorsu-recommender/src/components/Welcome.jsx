import { useState } from 'react'

export default function Welcome({ onStart }) {
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 4 }}>Welcome!</h2>
      <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>
        Enter your details to begin the assessment.
      </p>

      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14, color: '#334155' }}>
            Your Name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your full name"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14, color: '#334155' }}>
            School (optional)
          </label>
          <input
            value={school}
            onChange={e => setSchool(e.target.value)}
            placeholder="Your SHS school name"
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={() => onStart(name, school)}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '14px 0', fontSize: 16, fontWeight: 700,
            backgroundColor: name.trim() ? '#1a56db' : '#94a3b8', color: '#fff',
            border: 'none', borderRadius: 8, cursor: name.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Start Assessment
        </button>
      </div>
    </div>
  )
}
