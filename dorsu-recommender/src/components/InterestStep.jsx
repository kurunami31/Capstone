import { useState } from 'react'
import GlossaryTooltip from './GlossaryTooltip.jsx'
import { useTranslation } from '../hooks/useTranslation.js'
import { primaryBtn, secondaryBtn } from '../styles/shared.js'

const iconSvg = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'var(--text-secondary)', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: 'false' }

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
  const { t } = useTranslation()
  const [ratings, setRatings] = useState(data.interests || {})

  const setRating = (key, val) => {
    const next = { ...ratings, [key]: val }
    setRatings(next)
    onUpdate({ interests: next })
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8, color: 'var(--text-primary)' }}>{t('interest.title')}<GlossaryTooltip term="Career Cluster" /></h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
        {t('interest.select')}
      </p>

      <div style={{ display: 'grid', gap: 12 }}>
        {CLUSTERS.map(c => (
          <div key={c.key} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            backgroundColor: 'var(--card-bg)', borderRadius: 10,
            border: '1px solid var(--track-bg)',
          }}>
            <ClusterIcon name={c.key} />
            <div style={{ flex: 1, fontWeight: 500, color: 'var(--text-primary)' }}>{c.label}</div>
            <div className="full-mobile" style={{ display: 'flex', gap: 4, flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    onClick={() => setRating(c.key, val)}
                    aria-label={`${c.label}: ${LABELS[val - 1]}`}
                    style={{
                      flex: 1, minWidth: 0, height: 44, fontSize: 13, fontWeight: 600,
                      border: `2px solid ${ratings[c.key] === val ? '#3b82f6' : 'rgba(255,255,255,0.15)'}`,
                      backgroundColor: ratings[c.key] === val ? 'var(--accent-bg)' : 'var(--card-bg)',
                      color: ratings[c.key] === val ? 'var(--accent-text)' : 'var(--text-secondary)',
                      borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(val => (
                  <span key={val} style={{
                    flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--text-muted)',
                    minWidth: 0,
                  }}>{LABELS[val - 1]}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={() => { setRatings({}); onUpdate({ interests: {} }) }} style={{
          ...secondaryBtn, fontSize: 13, padding: '8px 16px',
        }}>
          Clear All
        </button>
      </div>

      <div className="stack-mobile" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={onBack} style={{ ...secondaryBtn, width: '100%' }}>Back</button>
        <button onClick={onNext} style={{ ...primaryBtn, width: '100%' }}>Next</button>
      </div>
    </div>
  )
}
