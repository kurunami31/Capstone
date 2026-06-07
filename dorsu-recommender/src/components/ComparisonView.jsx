import React from 'react'

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
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9997,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, overflowY: 'auto',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor: '#1e293b', borderRadius: 20, padding: 32, maxWidth: 900, width: '100%',
        border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, margin: 0 }}>Compare Programs</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20, padding: '4px 8px',
          }}>
            ✕
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `140px repeat(${results.length}, 1fr)`,
          gap: 0, fontSize: 13,
        }}>
          {/* Header row */}
          <div /> {/* empty corner */}
          {results.map((r, i) => (
            <div key={r.program.code} style={{
              textAlign: 'center', padding: '12px 8px',
              backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9', marginBottom: 4 }}>
                {r.program.name}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{r.program.faculty}</div>
            </div>
          ))}

          {/* Overall Match */}
          <div style={{ padding: '12px 8px', color: '#94a3b8', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            Overall Match
          </div>
          {results.map((r, i) => (
            <div key={r.program.code} style={{
              textAlign: 'center', padding: '12px 8px',
              backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
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
              <div style={{ padding: '12px 8px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {row.label}
              </div>
              {results.map((r, i) => (
                <div key={r.program.code} style={{
                  textAlign: 'center', padding: '12px 8px',
                  backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{ fontWeight: 600, color: codeColor(r.breakdown[row.key]) }}>{r.breakdown[row.key]}%</span>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Admission Chance */}
          <div style={{ padding: '12px 8px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            Admission Chance
          </div>
          {results.map((r, i) => (
            <div key={r.program.code} style={{
              textAlign: 'center', padding: '12px 8px',
              backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
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
          <div style={{ padding: '12px 8px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            CHED Priority
          </div>
          {results.map((r, i) => (
            <div key={r.program.code} style={{
              textAlign: 'center', padding: '12px 8px',
              backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {r.program.ched_priority ? (
                <span style={{ color: '#60a5fa' }}>Yes</span>
              ) : (
                <span style={{ color: '#64748b' }}>No</span>
              )}
            </div>
          ))}

          {/* Strand Compatibility */}
          <div style={{ padding: '12px 8px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            Compatible Strands
          </div>
          {results.map((r, i) => (
            <div key={r.program.code} style={{
              textAlign: 'center', padding: '12px 8px',
              backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {r.program.compatible_strands?.length > 0 ? (
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {r.program.compatible_strands.map(s => (
                    <span key={s} style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 4,
                      backgroundColor: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                    }}>{s}</span>
                  ))}
                </div>
              ) : (
                <span style={{ color: '#64748b' }}>—</span>
              )}
            </div>
          ))}

          {/* Career Paths */}
          <div style={{ padding: '12px 8px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            Career Paths
          </div>
          {results.map((r, i) => (
            <div key={r.program.code} style={{
              textAlign: 'center', padding: '12px 8px',
              backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
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
                <span style={{ color: '#64748b' }}>—</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
