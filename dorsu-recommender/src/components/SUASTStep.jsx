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

import GlossaryTooltip from './GlossaryTooltip.jsx'
import { useTranslation } from '../hooks/useTranslation.js'
import { primaryBtn, secondaryBtn } from '../styles/shared.js'

const TIER_SCORES = { very_high: 5, high: 4, moderate: 3, low: 2, not_taken: 0 }

function tierColor(val) {
  switch (val) {
    case 'very_high': return '#34d399'
    case 'high': return '#60a5fa'
    case 'moderate': return '#fbbf24'
    case 'low': return '#f87171'
    default: return '#475569'
  }
}

export default function SUASTStep({ data, onUpdate, onNext, onBack }) {
  const { t } = useTranslation()
  const tiers = data.suastTiers || {}

  const update = (key, val) => {
    onUpdate({ suastTiers: { ...tiers, [key]: val } })
  }

  const selectStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14,
    backgroundColor: 'var(--track-bg)', border: '1px solid var(--border-strong)',
    color: 'var(--text-primary)', outline: 'none',
  }

  const taken = SUBTESTS.filter(s => tiers[s.key] && tiers[s.key] !== 'not_taken')
  const avgScore = taken.length > 0
    ? Math.round(taken.reduce((sum, s) => sum + (TIER_SCORES[tiers[s.key]] || 0), 0) / taken.length * 20)
    : null

  return (
    <div>
      {avgScore !== null && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 10, marginBottom: 16,
          padding: '14px 16px', borderRadius: 10,
          background: 'var(--modal-bg, #1e293b)',
          border: '1px solid var(--border-strong)',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Composite Score</span>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#fbbf24' }}>{avgScore}%</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SUBTESTS.map(s => {
              const val = tiers[s.key] || 'not_taken'
              return (
                <span key={s.key} style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                  backgroundColor: tierColor(val) + '20',
                  color: tierColor(val),
                }}>
                  {s.label.split(' ')[0]} {val === 'not_taken' ? '—' : TIERS.find(t => t.value === val)?.label.split(' ')[0]}
                </span>
              )
            })}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 22, marginBottom: 8, color: 'var(--text-primary)' }}>{t('suast.title')}<GlossaryTooltip term="SUAST" /></h2>
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
