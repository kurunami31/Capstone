import { useState } from 'react'

const CLUSTERS = [
  { key: 'health', label: 'Health & Medicine', icon: '🩺' },
  { key: 'tech', label: 'Technology & Computing', icon: '💻' },
  { key: 'business', label: 'Business & Management', icon: '📊' },
  { key: 'engineering', label: 'Engineering & Construction', icon: '🏗️' },
  { key: 'education', label: 'Teaching & Education', icon: '📚' },
  { key: 'science', label: 'Science & Research', icon: '🔬' },
  { key: 'arts', label: 'Arts & Design', icon: '🎨' },
  { key: 'law', label: 'Law & Governance', icon: '⚖️' },
  { key: 'service', label: 'Hospitality & Service', icon: '🍽️' },
  { key: 'environment', label: 'Environment & Agriculture', icon: '🌿' },
]

const LABELS = ['Not Interested', 'Slightly', 'Moderately', 'Very', 'Extremely']

export default function InterestStep({ data, onUpdate, onNext, onBack }) {
  const [ratings, setRatings] = useState(data.interests || {})

  const setRating = (key, val) => {
    setRatings(r => ({ ...r, [key]: val }))
    onUpdate({ interests: { ...ratings, [key]: val } })
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Career Interests</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>
        Rate your interest in each career field from 1 (Not Interested) to 5 (Extremely Interested).
      </p>

      <div style={{ display: 'grid', gap: 12 }}>
        {CLUSTERS.map(c => (
          <div key={c.key} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            backgroundColor: '#f8f9fa', borderRadius: 8
          }}>
            <span style={{ fontSize: 22 }}>{c.icon}</span>
            <div style={{ flex: 1, fontWeight: 500 }}>{c.label}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => setRating(c.key, val)}
                  style={{
                    width: 36, height: 36, fontSize: 13, fontWeight: 600,
                    border: `2px solid ${ratings[c.key] === val ? '#1a56db' : '#ddd'}`,
                    backgroundColor: ratings[c.key] === val ? '#eef4ff' : '#fff',
                    borderRadius: 6, cursor: 'pointer'
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
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
