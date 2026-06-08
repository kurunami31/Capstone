import { useState, useEffect } from 'react'

const CARD = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 16,
  backdropFilter: 'blur(8px)',
}

const BTN_SECONDARY = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#94a3b8',
  padding: '8px 16px',
  borderRadius: 8,
  fontSize: 13,
  cursor: 'pointer',
}

export default function SettingsPage({ settings }) {
  const [localSettings, setLocalSettings] = useState({})

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 60px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px' }}>Settings</h1>
        <div style={{ ...CARD, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Scoring Weights</h2>
            <span style={{ fontSize: 12, color: '#64748b' }}>Adjust how recommendation scores are calculated</span>
          </div>
          {(() => {
            const weightFields = [
              { key: 'academic_weight', label: 'Academic Weight', defaultVal: 0.45, step: 0.05, min: 0, max: 1 },
              { key: 'suast_weight', label: 'SUAST Weight', defaultVal: 0.30, step: 0.05, min: 0, max: 1 },
              { key: 'personal_weight', label: 'Personal Fit Weight', defaultVal: 0.25, step: 0.05, min: 0, max: 1 },
            ]
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {weightFields.map(field => (
                  <div key={field.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label style={{ color: '#94a3b8', fontSize: 13 }}>{field.label}</label>
                      <span style={{ color: '#60a5fa', fontSize: 13, fontWeight: 600 }}>
                        {parseFloat(localSettings[field.key]) || field.defaultVal}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={parseFloat(localSettings[field.key]) || field.defaultVal}
                      onChange={e => setLocalSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={{ width: '100%', accentColor: '#3b82f6' }}
                    />
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={async () => {
                      const res = await fetch('/api/admin/settings', {
                        method: 'PUT', credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ settings: localSettings }),
                      })
                      if (res.ok) {
                        try { await fetch('/api/admin/activity?page=1&limit=1', { credentials: 'include' }) } catch (e) { console.error('Activity log error:', e) }
                      }
                    }}
                    style={{
                      background: '#3b82f6', border: 'none', color: '#fff',
                      padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Save Weights
                  </button>
                  <button
                    onClick={async () => {
                      const defaults = { academic_weight: '0.45', suast_weight: '0.30', personal_weight: '0.25' }
                      setLocalSettings(defaults)
                      const res = await fetch('/api/admin/settings', {
                        method: 'PUT', credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ settings: defaults }),
                      })
                      if (res.ok) {
                        try { await fetch('/api/admin/activity?page=1&limit=1', { credentials: 'include' }) } catch (e) { console.error('Activity log error:', e) }
                      }
                    }}
                    style={{
                      ...BTN_SECONDARY, padding: '8px 20px', fontSize: 13,
                    }}
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
