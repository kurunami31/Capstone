import { useState, useMemo } from 'react'
import { calculateRecommendations } from '../engine/scoring.js'

export default function ScoreSimulator({ studentData, programs, systemSettings, activePrograms, onClose }) {
  const [simGwa, setSimGwa] = useState(studentData.gwa || 85)
  const [simSuast, setSimSuast] = useState(() => {
    const tiers = studentData.suastTiers || {}
    const avg = Object.values(tiers).reduce((s, t) => {
      const tierMap = { High: 85, Medium: 70, Low: 55 }
      return s + (tierMap[t] || 70)
    }, 0) / Math.max(1, Object.keys(tiers).length)
    return Math.round(avg) || 70
  })

  const simData = useMemo(() => ({
    ...studentData,
    gwa: simGwa,
    suastTiers: { simulated: simSuast >= 80 ? 'High' : simSuast >= 65 ? 'Medium' : 'Low' },
  }), [studentData, simGwa, simSuast])

  const simResults = useMemo(() => {
    if (!systemSettings) return []
    return calculateRecommendations(simData, programs, {
      academicWeight: parseFloat(systemSettings.academic_weight) || 0.45,
      suastWeight: parseFloat(systemSettings.suast_weight) || 0.30,
      personalWeight: parseFloat(systemSettings.personal_weight) || 0.25,
      activePrograms,
    }).slice(0, 5)
  }, [simData, programs, systemSettings, activePrograms])

  const originalResults = useMemo(() => {
    if (!systemSettings) return []
    return calculateRecommendations(studentData, programs, {
      academicWeight: parseFloat(systemSettings.academic_weight) || 0.45,
      suastWeight: parseFloat(systemSettings.suast_weight) || 0.30,
      personalWeight: parseFloat(systemSettings.personal_weight) || 0.25,
      activePrograms,
    }).slice(0, 5)
  }, [studentData, programs, systemSettings, activePrograms])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        backgroundColor: 'var(--modal-bg, #1e293b)', borderRadius: 20, padding: 28, maxWidth: 520, width: '100%',
        border: '1px solid var(--card-border, rgba(255,255,255,0.08))', maxHeight: '90vh', overflow: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Score Simulator</h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
              GWA: <strong style={{ color: '#f1f5f9' }}>{simGwa}%</strong>
            </label>
            <input type="range" min={70} max={99} value={simGwa}
              onChange={e => setSimGwa(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#3b82f6' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569' }}>
              <span>70</span><span>99</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
              SUAST Score: <strong style={{ color: '#f1f5f9' }}>{simSuast}%</strong>
            </label>
            <input type="range" min={40} max={99} value={simSuast}
              onChange={e => setSimSuast(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#3b82f6' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#475569' }}>
              <span>40</span><span>99</span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>
            Simulated Top 5
          </div>
          {simResults.map((r, i) => {
            const orig = originalResults.find(o => o.program.code === r.program.code)
            const delta = orig ? r.totalScore - orig.totalScore : 0
            return (
              <div key={r.program.code} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 8,
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.program.name}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>
                    {r.totalScore}%
                  </div>
                  {delta !== 0 && (
                    <div style={{ fontSize: 11, fontWeight: 600, color: delta > 0 ? '#34d399' : '#f87171' }}>
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ fontSize: 11, color: '#475569', textAlign: 'center', marginTop: 12 }}>
          Adjust the sliders above to see how your scores affect recommendations
        </div>
      </div>
    </div>
  )
}
