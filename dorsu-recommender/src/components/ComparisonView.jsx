import React from 'react'
import useMobile from '../hooks/useMobile.js'

function codeColor(score) {
  if (score >= 80) return '#34d399'
  if (score >= 60) return '#fbbf24'
  return '#f87171'
}

function admissionColor(level) {
  if (level === 'High') return '#34d399'
  if (level === 'Moderate') return '#fbbf24'
  return '#f87171'
}

export default function ComparisonView({ results, onClose }) {
  const isMobile = useMobile()
  const labelWidth = isMobile ? 90 : 140
  const cellFont = isMobile ? 11 : 13
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9997,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, overflowY: 'auto',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor: 'var(--modal-bg)', borderRadius: 20, padding: 32, maxWidth: 900, width: '100%',
        border: '1px solid var(--card-border)', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 700, margin: 0 }}>Compare Programs</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ overflowX: 'auto', margin: '0 -8px', padding: '0 8px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `${labelWidth}px repeat(${results.length}, 1fr)`,
            gap: 0, fontSize: cellFont, minWidth: results.length > 2 ? 500 : 'auto',
          }}>
          {/* Header row */}
          <div /> {/* empty corner */}
          {results.map((r, i) => (
            <div key={r.program.code} style={{
              textAlign: 'center', padding: '12px 8px',
              backgroundColor: i % 2 === 0 ? 'var(--row-bg)' : 'transparent',
              borderBottom: '1px solid var(--track-bg)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                {r.program.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.program.faculty}</div>
            </div>
          ))}

          {/* Overall Match */}
          <div style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--track-bg)' }}>
            Overall Match
          </div>
          {results.map((r, i) => (
            <div key={r.program.code} style={{
              textAlign: 'center', padding: '12px 8px',
              backgroundColor: i % 2 === 0 ? 'var(--row-bg)' : 'transparent',
              borderBottom: '1px solid var(--track-bg)',
            }}>
              <span style={{ fontWeight: 700, fontSize: 20, color: codeColor(r.totalScore) }}>{r.totalScore}%</span>
            </div>
          ))}

          {/* Scores */}
          {[
            { label: 'Academic', key: 'academic' },
            { label: 'SUAST', key: 'suast' },
            { label: 'Personal Fit', key: 'personalFit' },
          ].map(row => (
            <React.Fragment key={row.key}>
              <div style={{ padding: '12px 8px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--track-bg)' }}>
                {row.label}
              </div>
              {results.map((r, i) => (
                <div key={r.program.code} style={{
                  textAlign: 'center', padding: '12px 8px',
                  backgroundColor: i % 2 === 0 ? 'var(--row-bg)' : 'transparent',
                  borderBottom: '1px solid var(--track-bg)',
                }}>
                  <span style={{ fontWeight: 600, color: codeColor(r.breakdown[row.key]) }}>{r.breakdown[row.key]}%</span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Admission Chance */}
          <div style={{ padding: '12px 8px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--track-bg)' }}>
            Admission Chance
          </div>
          {results.map((r, i) => (
            <div key={r.program.code} style={{
              textAlign: 'center', padding: '12px 8px',
              backgroundColor: i % 2 === 0 ? 'var(--row-bg)' : 'transparent',
              borderBottom: '1px solid var(--track-bg)',
            }}>
              <span style={{
                fontWeight: 600, color: admissionColor(r.admission.label),
                display: 'inline-block', padding: '2px 10px', borderRadius: 8,
                backgroundColor: `${admissionColor(r.admission.label)}15`,
              }}>
                {r.admission.label}
              </span>
            </div>
          ))}

          {/* CHED Priority */}
          <div style={{ padding: '12px 8px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--track-bg)' }}>
            CHED Priority
          </div>
          {results.map((r, i) => (
            <div key={r.program.code} style={{
              textAlign: 'center', padding: '12px 8px',
              backgroundColor: i % 2 === 0 ? 'var(--row-bg)' : 'transparent',
              borderBottom: '1px solid var(--track-bg)',
            }}>
              {r.program.ched_priority ? (
                <span style={{ color: 'var(--accent-text)' }}>Yes</span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>No</span>
              )}
            </div>
          ))}

          {/* Strand Compatibility */}
          <div style={{ padding: '12px 8px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--track-bg)' }}>
            Compatible Strands
          </div>
          {results.map((r, i) => (
            <div key={r.program.code} style={{
              textAlign: 'center', padding: '12px 8px',
              backgroundColor: i % 2 === 0 ? 'var(--row-bg)' : 'transparent',
              borderBottom: '1px solid var(--track-bg)',
            }}>
              {r.program.compatible_strands?.length > 0 ? (
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {r.program.compatible_strands.map(s => (
                    <span key={s} style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 4,
                      backgroundColor: 'var(--accent-bg)', color: 'var(--accent-text)',
                    }}>{s}</span>
                  ))}
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>—</span>
              )}
            </div>
          ))}

          {/* Career Paths */}
          <div style={{ padding: '12px 8px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--track-bg)' }}>
            Career Paths
          </div>
          {results.map((r, i) => (
            <div key={r.program.code} style={{
              textAlign: 'center', padding: '12px 8px',
              backgroundColor: i % 2 === 0 ? 'var(--row-bg)' : 'transparent',
              borderBottom: '1px solid var(--track-bg)',
            }}>
              {r.program.career_paths?.length > 0 ? (
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {r.program.career_paths.slice(0, 3).map(c => (
                    <span key={c} style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 4,
                      backgroundColor: 'rgba(20,184,166,0.1)', color: '#5eead4',
                    }}>{c}</span>
                  ))}
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>—</span>
              )}
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  )
}
