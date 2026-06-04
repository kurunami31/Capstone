import { useState } from 'react'

export default function Welcome({ onStart }) {
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 40, textAlign: 'center' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>DOrSU College Program Recommender</h1>
      <p style={{ color: '#666', marginBottom: 32, lineHeight: 1.6 }}>
        Find the best college programs at Davao Oriental State University
        based on your SHS strand, grades, aptitude, and personal interests.
      </p>
      <div style={{ textAlign: 'left', marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Your Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter your full name"
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', fontSize: 14 }}
        />
      </div>
      <div style={{ textAlign: 'left', marginBottom: 32 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>School (optional)</label>
        <input
          value={school}
          onChange={e => setSchool(e.target.value)}
          placeholder="Your SHS school name"
          style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', fontSize: 14 }}
        />
      </div>
      <button
        onClick={() => onStart(name, school)}
        disabled={!name.trim()}
        style={{
          padding: '12px 48px', fontSize: 16, fontWeight: 600,
          backgroundColor: name.trim() ? '#1a56db' : '#aaa',
          color: '#fff', border: 'none', borderRadius: 8, cursor: name.trim() ? 'pointer' : 'not-allowed'
        }}
      >
        Start Assessment
      </button>
    </div>
  )
}
