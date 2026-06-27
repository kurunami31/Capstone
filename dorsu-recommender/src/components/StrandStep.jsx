const STRANDS = [
  { value: 'STEM', label: 'STEM', desc: 'Science, Technology, Engineering, and Mathematics' },
  { value: 'ABM', label: 'ABM', desc: 'Accountancy, Business, and Management' },
  { value: 'HUMSS', label: 'HUMSS', desc: 'Humanities and Social Sciences' },
  { value: 'GAS', label: 'GAS', desc: 'General Academic Strand' },
  { value: 'TVL', label: 'TVL', desc: 'Technical-Vocational-Livelihood' },
  { value: 'SPORTS', label: 'Sports', desc: 'Sports Track' },
  { value: 'ARTS', label: 'Arts & Design', desc: 'Arts and Design Track' },
]

import GlossaryTooltip from './GlossaryTooltip.jsx'
import { useTranslation } from '../hooks/useTranslation.js'
import { btnStyle } from '../styles/shared.js'

export default function StrandStep({ data, onUpdate, onNext, onBack }) {
  const { t } = useTranslation()
  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8, color: 'var(--text-primary)' }}>{t('strand.title')}<GlossaryTooltip term="Strand" /></h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{t('strand.select')}</p>
      <div style={{ display: 'grid', gap: 10 }}>
        {STRANDS.map(s => (
          <label
            key={s.value}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
              border: `2px solid ${data.strand === s.value ? '#3b82f6' : 'var(--border-strong)'}`,
              borderRadius: 10, cursor: 'pointer',
              backgroundColor: data.strand === s.value ? 'var(--accent-bg)' : 'var(--card-bg)',
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
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.desc}</div>
            </div>
          </label>
        ))}
      </div>
      <div className="stack-mobile" style={{ display: 'flex', gap: 10 }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              flex: 1, marginTop: 24, padding: '12px 0', fontSize: 15, fontWeight: 600,
              backgroundColor: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, cursor: 'pointer',
            }}
          >
            Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!data.strand}
          style={{ ...btnStyle(data.strand), flex: 1 }}
        >
          Next
        </button>
      </div>
      {!data.strand && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
          Select a strand to continue
        </p>
      )}
    </div>
  )
}
