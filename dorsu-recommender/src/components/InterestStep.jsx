import { useState } from 'react'

const iconSvg = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: '#555', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

function ClusterIcon({ name }) {
  switch (name) {
    case 'health':
      return <svg {...iconSvg}><path d="M12 6v12M6 12h12"/></svg>
    case 'tech':
      return <svg {...iconSvg}><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8"/></svg>
    case 'business':
      return <svg {...iconSvg}><rect x="4" y="14" width="4" height="6"/><rect x="10" y="8" width="4" height="12"/><rect x="16" y="2" width="4" height="18"/></svg>
    case 'engineering':
      return <svg {...iconSvg}><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4m10-10h-4M6 12H2m16.07-6.07l-2.83 2.83M8.76 15.24l-2.83 2.83M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10z"/></svg>
    case 'education':
      return <svg {...iconSvg}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    case 'science':
      return <svg {...iconSvg}><path d="M10 2h4"/><path d="M12 2v8"/><path d="M4 22h16"/><path d="M18 22l-6-10-6 10"/><path d="M8 16h8"/></svg>
    case 'arts':
      return <svg {...iconSvg}><circle cx="12" cy="12" r="10"/><circle cx="8" cy="9" r="2" fill="#555"/><circle cx="16" cy="8" r="2" fill="#555"/><circle cx="14" cy="16" r="2" fill="#555"/></svg>
    case 'law':
      return <svg {...iconSvg}><path d="M12 2v16"/><path d="M8 22h8"/><path d="M12 18l-6 6"/><path d="M12 18l6 6"/><path d="M6 8h12"/><path d="M18 8l2 10H4L2 8z"/></svg>
    case 'service':
      return <svg {...iconSvg}><path d="M8 4h8l4 6-4 10H8L4 10z"/><circle cx="12" cy="14" r="2"/></svg>
    case 'environment':
      return <svg {...iconSvg}><path d="M12 2C8 6 4 10 4 16c0 4.42 3.58 8 8 8s8-3.58 8-8c0-6-4-10-8-14z"/><path d="M8 16c0-2 1.5-4 4-6"/></svg>
    default:
      return null
  }
}

const CLUSTERS = [
  { key: 'health', label: 'Health & Medicine' },
  { key: 'tech', label: 'Technology & Computing' },
  { key: 'business', label: 'Business & Management' },
  { key: 'engineering', label: 'Engineering & Construction' },
  { key: 'education', label: 'Teaching & Education' },
  { key: 'science', label: 'Science & Research' },
  { key: 'arts', label: 'Arts & Design' },
  { key: 'law', label: 'Law & Governance' },
  { key: 'service', label: 'Hospitality & Service' },
  { key: 'environment', label: 'Environment & Agriculture' },
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
            <ClusterIcon name={c.key} />
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
