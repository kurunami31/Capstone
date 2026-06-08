import { useMemo } from 'react'
import { generateExplanations, calculateSkillsGap } from '../engine/explanations.js'

function codeColor(score) {
  if (score >= 80) return '#34d399'
  if (score >= 60) return '#fbbf24'
  return '#f87171'
}

export default function ProgramDetailModal({ result, studentData, onClose }) {
  const { program, breakdown, admission, totalScore } = result

  const explanations = useMemo(() => generateExplanations(result, studentData), [result, studentData])
  const skillsGap = useMemo(() => calculateSkillsGap(studentData, program), [studentData, program])

  const metCount = skillsGap.filter(s => s.status === 'met').length
  const strandColor = (type) => type === 'compatible' ? '#34d399' : type === 'alternative' ? '#fbbf24' : '#f87171'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9997,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, overflowY: 'auto',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor: '#1e293b', borderRadius: 20, padding: 32,
        maxWidth: 640, width: '100%', maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.08)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>{program.name}</h2>
            <div style={{ fontSize: 13, color: '#64748b' }}>{program.faculty}</div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#94a3b8',
            cursor: 'pointer', fontSize: 20, padding: '0 4px', flexShrink: 0,
          }}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {program.ched_priority && (
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 20,
              backgroundColor: 'rgba(59,130,246,0.15)', color: '#60a5fa',
              border: '1px solid rgba(59,130,246,0.25)',
            }}>CHED Priority Course</span>
          )}
          {program.is_board_program && (
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 20,
              backgroundColor: 'rgba(52,211,153,0.15)', color: '#34d399',
              border: '1px solid rgba(52,211,153,0.25)',
            }}>{program.board_exam ? `Licensure: ${program.board_exam}` : 'Board Program'}</span>
          )}
          <span style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 20,
            backgroundColor: `${codeColor(totalScore)}15`, color: codeColor(totalScore),
            border: `1px solid ${codeColor(totalScore)}25`,
          }}>{totalScore}% Match</span>
        </div>

        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px' }}>Strand Compatibility</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { label: 'Compatible', items: program.compatible_strands, type: 'compatible' },
              { label: 'Alternative', items: program.alternative_strands, type: 'alternative' },
              { label: 'Incompatible', items: program.incompatible_strands, type: 'incompatible' },
            ].filter(s => s.items?.length).map(s => (
              <div key={s.type} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: '#94a3b8', width: 80, flexShrink: 0 }}>{s.label}:</span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {s.items.map(st => (
                    <span key={st} style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11,
                      backgroundColor: `${strandColor(s.type)}15`,
                      color: strandColor(s.type),
                      border: `1px solid ${strandColor(s.type)}25`,
                    }}>{st}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px' }}>Score Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Academic', score: breakdown.academic },
              { label: 'SUAST', score: breakdown.suast },
              { label: 'Personal Fit', score: breakdown.personalFit },
              { label: 'Admission Chance', score: admission.label, isAdmission: true },
            ].map(s => (
              <div key={s.label} style={{
                padding: '10px 14px', borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{s.label}</div>
                <div style={{
                  fontSize: 20, fontWeight: 700,
                  color: s.isAdmission ? admissionColor(s.score) : codeColor(s.score),
                }}>
                  {s.isAdmission ? s.score : `${s.score}%`}
                </div>
                {!s.isAdmission && (
                  <div style={{
                    marginTop: 4, height: 3, borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${s.score}%`, height: '100%', borderRadius: 2,
                      backgroundColor: codeColor(s.score),
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px' }}>Weighted Subjects</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(program.weighted_subjects || {}).map(([subj, weight]) => {
              const grade = studentData.grades?.[subj] || 0
              return (
                <div key={subj} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ width: 60, color: '#94a3b8', flexShrink: 0 }}>
                    {subj.charAt(0).toUpperCase() + subj.slice(1)}
                  </span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${weight * 100}%`, height: '100%', borderRadius: 3,
                      backgroundColor: '#3b82f6',
                    }} />
                  </div>
                  <span style={{ width: 30, textAlign: 'right', color: '#64748b' }}>×{weight}</span>
                  {grade > 0 && <span style={{ width: 30, textAlign: 'right', color: codeColor(grade) }}>{grade}</span>}
                </div>
              )
            })}
          </div>
        </section>

        {program.holland_codes?.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px' }}>Holland Code Alignment</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {program.holland_codes.map((h, i) => {
                const code = h[0]
                const weight = program.holland_code_weights?.[code] || 0
                const colors = { R: '#3b82f6', I: '#8b5cf6', A: '#ec4899', S: '#f59e0b', E: '#10b981', C: '#06b6d4' }
                return (
                  <div key={i} style={{
                    padding: '8px 14px', borderRadius: 8,
                    backgroundColor: `${colors[code] || '#64748b'}15`,
                    border: `1px solid ${colors[code] || '#64748b'}25`,
                    textAlign: 'center', flex: 1,
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: colors[code] || '#64748b' }}>{code}</span>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{h}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Weight: {Math.round(weight * 100)}%</div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px' }}>
            Skills Gap Analysis
          </h3>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
            You meet <strong style={{ color: '#f1f5f9' }}>{metCount}</strong> of <strong style={{ color: '#f1f5f9' }}>{skillsGap.length}</strong> required skills
            {metCount === skillsGap.length ? ' — great fit!' : metCount >= skillsGap.length / 2 ? ' — close to the target.' : ' — room for improvement.'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {skillsGap.map(s => (
              <div key={s.skill} style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                padding: '6px 10px', borderRadius: 6,
                backgroundColor: s.status === 'met' ? 'rgba(52,211,153,0.05)' : s.status === 'close' ? 'rgba(251,191,36,0.05)' : 'rgba(248,113,113,0.05)',
              }}>
                <span style={{ width: 80, color: '#94a3b8', flexShrink: 0 }}>{s.skill}</span>
                <span style={{ color: '#64748b' }}>You:</span>
                <div style={{
                  width: 40, height: 4, borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${(s.studentRating / 5) * 100}%`, height: '100%',
                    backgroundColor: '#3b82f6', borderRadius: 2,
                  }} />
                </div>
                <span style={{ width: 20, color: '#f1f5f9', fontWeight: 600 }}>{s.studentRating}</span>
                <span style={{ color: '#64748b' }}>Need:</span>
                <div style={{
                  width: 40, height: 4, borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${(s.required / 5) * 100}%`, height: '100%',
                    backgroundColor: '#f87171', borderRadius: 2,
                  }} />
                </div>
                <span style={{ width: 20, color: '#f1f5f9', fontWeight: 600 }}>{s.required}</span>
                <span style={{
                  marginLeft: 'auto', fontWeight: 600,
                  color: s.gap >= 0 ? '#34d399' : s.gap >= -1 ? '#fbbf24' : '#f87171',
                }}>
                  {s.gap >= 0 ? '✓ Met' : s.gap >= -1 ? '~ Close' : `−${Math.abs(s.gap)}`}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px' }}>Why This Match?</h3>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {explanations.map((exp, i) => (
              <li key={i} style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{exp}</li>
            ))}
          </ul>
        </section>

        {program.career_clusters?.length > 0 && (
          <section style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px' }}>Career Clusters</h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {program.career_clusters.map(c => (
                <span key={c} style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 20,
                  backgroundColor: 'rgba(20,184,166,0.1)', color: '#5eead4',
                  border: '1px solid rgba(20,184,166,0.2)',
                }}>{c}</span>
              ))}
            </div>
          </section>
        )}

        {program.career_paths?.length > 0 && (
          <section>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 10px' }}>Career Paths</h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {program.career_paths.map((c, i) => (
                <span key={i} style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 20,
                  backgroundColor: 'rgba(20,184,166,0.1)', color: '#5eead4',
                  border: '1px solid rgba(20,184,166,0.2)',
                }}>{c}</span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function admissionColor(level) {
  if (level === 'High') return '#34d399'
  if (level === 'Moderate') return '#fbbf24'
  return '#f87171'
}
