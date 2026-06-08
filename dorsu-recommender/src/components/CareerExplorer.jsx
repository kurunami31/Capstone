import { useState, useMemo, useEffect } from 'react'
import programs from '../data/programs.json'
import careersData from '../data/careers.json'
import ProgramDetailModal from './ProgramDetailModal.jsx'

const careerLookup = Object.fromEntries(careersData.map(c => [c.name, c]))

const facultyLogoMap = {
  'Faculty of Computing, Engineering, and Technology (FaCET)': '/logos/facet logo final.png',
  'Faculty of Teacher Education': '/logos/FTED.png',
  'Faculty of Criminal Justice Education': '/logos/FCJE.png',
  'Faculty of Nursing and Allied Health Sciences': '/logos/FNAHS.png',
  'Faculty of Agriculture and Life Sciences': '/logos/FALS.png',
  'Faculty of Business and Management': '/logos/FBM.png',
}

const faculties = [...new Set(programs.map(p => p.faculty))].sort()

export default function CareerExplorer({ studentData }) {
  const [faculty, setFaculty] = useState('')
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => { setPage(1) }, [faculty])

  const allCareers = useMemo(() => {
    const map = {}
    for (const p of programs) {
      const paths = p.career_paths || p.careers || []
      for (const c of paths) {
        if (!map[c]) map[c] = []
        map[c].push(p)
      }
    }
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [])

  const filtered = useMemo(() => {
    if (!faculty) return allCareers
    return allCareers.filter(([, progs]) => progs.some(p => p.faculty === faculty))
  }, [faculty, allCareers])

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE)
  const currentCareers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--gradient-start, #0f172a) 0%, var(--gradient-mid, #1e3a5f) 50%, var(--gradient-end, #0f172a) 100%)', padding: '24px 20px 60px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', margin: '0 0 4px' }}>Career Path Explorer</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #64748b)', margin: '0 0 20px' }}>
          Browse {allCareers.length} career paths and the programs that lead to them
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={faculty} onChange={e => setFaculty(e.target.value)} style={{
            padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-strong)',
            background: 'var(--input-bg)', color: 'var(--text-input)',
            fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'inherit', minWidth: 180,
          }}>
            <option value="" style={{ color: '#1e293b' }}>All Faculties</option>
            {faculties.map(f => <option key={f} value={f} style={{ color: '#1e293b' }}>{f}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 15, margin: 0 }}>No careers found.</p>
          </div>
        ) : (
          <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentCareers.map(([career, progs]) => (
              <div key={career} style={{
                borderRadius: 16,
                border: '1px solid var(--track-bg)',
                background: expanded === career ? 'var(--track-bg)' : 'var(--row-bg)',
                overflow: 'hidden', transition: 'all 0.15s',
              }}>
                <button
                  onClick={() => setExpanded(expanded === career ? null : career)}
                  style={{
                    width: '100%', padding: '16px 20px', border: 'none',
                    background: 'transparent', color: 'inherit',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 12, fontFamily: 'inherit',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-input)' }}>{career}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {progs.length} program{progs.length !== 1 ? 's' : ''} • {progs.map(p => p.faculty).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    style={{ transform: expanded === career ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {expanded === career && (
                  <>
                  {careerLookup[career] && (
                    <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid var(--track-bg)' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{careerLookup[career].description}</p>
                      {careerLookup[career].what_they_do && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{careerLookup[career].what_they_do}</p>
                      )}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {careerLookup[career].skills.map(s => (
                          <span key={s} style={{
                            fontSize: 11, padding: '3px 10px', borderRadius: 6,
                            background: 'var(--accent-bg)', color: 'var(--accent-text)',
                          }}>{s}</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        {careerLookup[career].shs_strands.map(s => (
                          <span key={s} style={{
                            fontSize: 10, padding: '2px 8px', borderRadius: 4,
                            background: 'rgba(251,191,36,0.1)', color: '#fbbf24',
                          }}>{s}</span>
                        ))}
                        <span style={{
                          fontSize: 11, padding: '3px 10px', borderRadius: 6,
                          background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                        }}>Holland: {careerLookup[career].holland_code}</span>
                        {careerLookup[career].board_exam && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                            background: 'rgba(52,211,153,0.15)', color: '#34d399',
                          }}>Board Exam Required</span>
                        )}
                        <span style={{
                          fontSize: 11, padding: '3px 10px', borderRadius: 6,
                          background: 'rgba(148,163,184,0.1)', color: 'var(--text-secondary)',
                        }}>{careerLookup[career].salary_range}</span>
                      </div>
                    </div>
                  )}
                  <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {progs.map(p => (
                      <button
                        key={p.code}
                        onClick={() => setSelectedProgram(p)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 14px', borderRadius: 10,
                          border: '1px solid var(--track-bg)',
                          background: 'var(--row-bg)', cursor: 'pointer',
                          color: 'inherit', textAlign: 'left', fontFamily: 'inherit',
                          width: '100%',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.borderColor = 'var(--accent-bg)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--row-bg)'; e.currentTarget.style.borderColor = 'var(--track-bg)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {facultyLogoMap[p.faculty] && (
                            <img src={facultyLogoMap[p.faculty]} alt="" style={{ width: 14, height: 14, borderRadius: 3, objectFit: 'cover' }} />
                          )}
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-input)' }}>{p.name}</span>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.faculty}</span>
                      </button>
                    ))}
                  </div>
                  </>
                )}
              </div>
            ))}
          </div>
          {filtered.length > 0 && pageCount > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center', marginTop: 16 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '1px solid var(--track-bg)',
                  background: 'transparent', color: page === 1 ? 'var(--text-muted)' : 'var(--text-input)',
                  fontSize: 12, cursor: page === 1 ? 'default' : 'pointer', fontFamily: 'inherit',
                }}
              >
                Previous
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: 'none',
                    background: page === p ? 'var(--accent-bg)' : 'transparent',
                    color: page === p ? 'var(--accent-text)' : 'var(--text-input)',
                    fontSize: 13, fontWeight: page === p ? 700 : 400,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '1px solid var(--track-bg)',
                  background: 'transparent', color: page === pageCount ? 'var(--text-muted)' : 'var(--text-input)',
                  fontSize: 12, cursor: page === pageCount ? 'default' : 'pointer', fontFamily: 'inherit',
                }}
              >
                Next
              </button>
            </div>
          )}
          </>
        )}
      </div>

      {selectedProgram && (
        <ProgramDetailModal
          result={{ program: selectedProgram }}
          studentData={studentData}
          onClose={() => setSelectedProgram(null)}
        />
      )}
    </div>
  )
}
