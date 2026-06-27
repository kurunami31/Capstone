import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation.js'

export default function Welcome({ onStart, onBack }) {
  const [school, setSchool] = useState('')
  const { t } = useTranslation()

  const handleStart = () => {
    onStart(school.trim())
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 4, color: 'var(--text-primary)' }}>{t('welcome.title')}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
        {t('welcome.description')}
      </p>

      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: 'var(--label-color)' }}>
            {t('welcome.school')} <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            value={school}
            onChange={e => setSchool(e.target.value)}
            placeholder={t('welcome.schoolPlaceholder')}
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 8, fontSize: 14,
              backgroundColor: 'var(--track-bg)', border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
            }}
          />

        </div>

        <button
          onClick={handleStart}
          style={{
            width: '100%', padding: '14px 0', fontSize: 16, fontWeight: 700,
            backgroundColor: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {t('assessment.start')}
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
            {t('assessment.cancel')}
          </button>
        )}
      </div>
    </div>
  )
}
