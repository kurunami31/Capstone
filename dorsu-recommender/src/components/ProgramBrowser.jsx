import { useState, useMemo, useEffect } from 'react'
import useMobile from '../hooks/useMobile.js'
import programs from '../data/programs.json'
import ProgramDetailModal from './ProgramDetailModal.jsx'

const faculties = [...new Set(programs.map(p => p.faculty))].sort()
const allStrands = [...new Set(programs.flatMap(p => [...(p.compatible_strands || []), ...(p.alternative_strands || [])]))].filter(s => ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL'].includes(s)).sort()

const facultyLogoMap = {
  'Faculty of Computing, Engineering, and Technology (FaCET)': '/logos/facet logo final.png',
  'Faculty of Teacher Education': '/logos/FTED.png',
  'Faculty of Criminal Justice Education': '/logos/FCJE.png',
  'Faculty of Nursing and Allied Health Sciences': '/logos/FNAHS.png',
  'Faculty of Agriculture and Life Sciences': '/logos/FALS.png',
  'Faculty of Business and Management': '/logos/FBM.png',
}

export default function ProgramBrowser({ activePrograms, studentData, systemSettings }) {
  const isMobile = useMobile()
  const [search, setSearch] = useState('')
  const [faculty, setFaculty] = useState('')
  const [strand, setStrand] = useState('')
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 5

  useEffect(() => { setPage(1) }, [search, faculty, strand])

  const filtered = useMemo(() => {
    return programs.filter(p => {
      if (search) {
        const q = search.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !(p.description || '').toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false
      }
      if (faculty && p.faculty !== faculty) return false
      if (strand) {
        const compat = [...(p.compatible_strands || []), ...(p.alternative_strands || [])]
        if (!compat.includes(strand)) return false
      }
      return true
    })
  }, [search, faculty, strand])

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE)
  const currentPrograms = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--gradient-start, #0f172a) 0%, var(--gradient-mid, #1e3a5f) 50%, var(--gradient-end, #0f172a) 100%)', padding: '24px 20px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', margin: '0 0 4px' }}>Program Browser</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #64748b)', margin: '0 0 20px' }}>
          Explore all {programs.length} programs offered at DOrSU
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text" placeholder="Search programs..."
            value={search} onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, minWidth: isMobile ? 140 : 200, padding: '10px 14px', borderRadius: 10,
                border: '1px solid var(--input-border, rgba(255,255,255,0.1))',
                background: 'var(--input-bg, rgba(255,255,255,0.05))', color: 'var(--text-primary, #e2e8f0)',
                fontSize: isMobile ? 13 : 14, outline: 'none', fontFamily: 'inherit',
              }}
          />
          <select value={faculty} onChange={e => setFaculty(e.target.value)} style={{ ...selectStyle, minWidth: isMobile ? '100%' : 160, flex: isMobile ? 1 : undefined }}>
            <option value="" style={{ color: '#1e293b' }}>All Faculties</option>
            {faculties.map(f => <option key={f} value={f} style={{ color: '#1e293b' }}>{f}</option>)}
          </select>
          <select value={strand} onChange={e => setStrand(e.target.value)} style={{ ...selectStyle, minWidth: isMobile ? '100%' : 160, flex: isMobile ? 1 : undefined }}>
            <option value="" style={{ color: '#1e293b' }}>All Strands</option>
            {allStrands.map(s => <option key={s} value={s} style={{ color: '#1e293b' }}>{s}</option>)}
          </select>
          {(search || faculty || strand) && (
            <button onClick={() => { setSearch(''); setFaculty(''); setStrand('') }} style={{
              padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border-strong)',
              background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
              fontWeight: 600, fontFamily: 'inherit',
            }}>
              Clear Filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12 }}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <p style={{ fontSize: 15, margin: 0 }}>No programs match your filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '240px' : '280px'}, 1fr))`, gap: 14 }}>
            {currentPrograms.map(p => (
              <ProgramCard
                key={p.code}
                program={p}
                active={activePrograms?.[p.code] !== false}
                onClick={() => setSelectedProgram(p)}
              />
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <p style={{ fontSize: 12, color: '#475569', textAlign: 'center' }}>
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} programs
            </p>
            {pageCount > 1 && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
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
          </div>
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

const selectStyle = {
  padding: '10px 14px', borderRadius: 10, border: '1px solid var(--input-border, rgba(255,255,255,0.1))',
  background: 'var(--input-bg, rgba(255,255,255,0.05))', color: 'var(--text-input)',
  fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
  minWidth: 160,
}

function ProgramCard({ program: p, active, onClick }) {
  const careers = p.career_paths?.slice(0, 3) || p.careers?.slice(0, 3) || []
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'var(--card-bg, rgba(255,255,255,0.04))' : 'var(--row-bg)',
        border: `1px solid ${active ? 'var(--card-border, rgba(255,255,255,0.08))' : 'var(--row-bg)'}`,
        borderRadius: 16, padding: 20, cursor: 'pointer',
        textAlign: 'left', fontFamily: 'inherit', width: '100%',
        transition: 'all 0.15s', opacity: active ? 1 : 0.5,
        color: 'inherit',
      }}
      onMouseEnter={e => { if (active) { e.currentTarget.style.background = 'var(--hover-bg, rgba(255,255,255,0.07))'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)' } }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? 'var(--card-bg, rgba(255,255,255,0.04))' : 'var(--row-bg)'; e.currentTarget.style.borderColor = active ? 'var(--card-border, rgba(255,255,255,0.08))' : 'var(--row-bg)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', marginBottom: 2 }}>{p.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {facultyLogoMap[p.faculty] && (
              <img src={facultyLogoMap[p.faculty]} alt="" style={{ width: 16, height: 16, borderRadius: 3, objectFit: 'cover' }} />
            )}
            {p.faculty}
          </div>
        </div>
        {p.is_board_program && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
            background: 'rgba(52,211,153,0.15)', color: '#34d399',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Board
          </span>
        )}
      </div>
      {p.description && (
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.4 }}>
          {p.description.length > 120 ? p.description.slice(0, 120) + '...' : p.description}
        </p>
      )}
      {careers.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {careers.map(c => (
            <span key={c} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 6,
              background: 'var(--accent-bg)', color: 'var(--accent-text)',
            }}>
              {c}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
        {(p.compatible_strands || []).slice(0, 3).map(s => (
          <span key={s} style={{
            fontSize: 9, padding: '1px 6px', borderRadius: 4,
            background: 'rgba(251,191,36,0.1)', color: '#fbbf24',
          }}>
            {s}
          </span>
        ))}
        {(p.alternative_strands || []).slice(0, 2).map(s => (
          <span key={s} style={{
            fontSize: 9, padding: '1px 6px', borderRadius: 4,
            background: 'rgba(148,163,184,0.1)', color: 'var(--text-secondary)',
          }}>
            {s}
          </span>
        ))}
      </div>
    </button>
  )
}
