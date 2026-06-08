import { useState, useMemo } from 'react'
import programs from '../data/programs.json'
import ProgramDetailModal from './ProgramDetailModal.jsx'

const faculties = [...new Set(programs.map(p => p.faculty))].sort()
const allStrands = [...new Set(programs.flatMap(p => [...(p.compatible_strands || []), ...(p.alternative_strands || [])]))].sort()

export default function ProgramBrowser({ activePrograms, studentData, systemSettings }) {
  const [search, setSearch] = useState('')
  const [faculty, setFaculty] = useState('')
  const [strand, setStrand] = useState('')
  const [selectedProgram, setSelectedProgram] = useState(null)

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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--gradient-start, #0f172a) 0%, var(--gradient-mid, #1e3a5f) 50%, var(--gradient-end, #0f172a) 100%)', padding: '24px 20px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', margin: '0 0 4px' }}>Program Browser</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #64748b)', margin: '0 0 20px' }}>
          Explore all {programs.length} programs offered at DOrSU
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text" placeholder="Search programs..."
            value={search} onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10,
                border: '1px solid var(--input-border, rgba(255,255,255,0.1))',
                background: 'var(--input-bg, rgba(255,255,255,0.05))', color: 'var(--text-primary, #e2e8f0)',
                fontSize: 14, outline: 'none', fontFamily: 'inherit',
              }}
          />
          <select value={faculty} onChange={e => setFaculty(e.target.value)} style={selectStyle}>
            <option value="">All Faculties</option>
            {faculties.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={strand} onChange={e => setStrand(e.target.value)} style={selectStyle}>
            <option value="">All Strands</option>
            {allStrands.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(search || faculty || strand) && (
            <button onClick={() => { setSearch(''); setFaculty(''); setStrand('') }} style={{
              padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: '#94a3b8', fontSize: 13, cursor: 'pointer',
              fontWeight: 600, fontFamily: 'inherit',
            }}>
              Clear Filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12 }}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <p style={{ fontSize: 15, margin: 0 }}>No programs match your filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
            {filtered.map(p => (
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
          <p style={{ fontSize: 12, color: '#475569', marginTop: 16, textAlign: 'center' }}>
            Showing {filtered.length} of {programs.length} programs
          </p>
        )}
      </div>

      {selectedProgram && (
        <ProgramDetailModal
          program={selectedProgram}
          studentData={studentData}
          onClose={() => setSelectedProgram(null)}
        />
      )}
    </div>
  )
}

const selectStyle = {
  padding: '10px 14px', borderRadius: 10, border: '1px solid var(--input-border, rgba(255,255,255,0.1))',
  background: 'var(--input-bg, rgba(255,255,255,0.05))', color: 'var(--text-primary, #e2e8f0)',
  fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
  minWidth: 160,
}

function ProgramCard({ program: p, active, onClick }) {
  const careers = p.career_paths?.slice(0, 3) || p.careers?.slice(0, 3) || []
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'var(--card-bg, rgba(255,255,255,0.04))' : 'rgba(255,255,255,0.015)',
        border: `1px solid ${active ? 'var(--card-border, rgba(255,255,255,0.08))' : 'rgba(255,255,255,0.03)'}`,
        borderRadius: 16, padding: 20, cursor: 'pointer',
        textAlign: 'left', fontFamily: 'inherit', width: '100%',
        transition: 'all 0.15s', opacity: active ? 1 : 0.5,
        color: 'inherit',
      }}
      onMouseEnter={e => { if (active) { e.currentTarget.style.background = 'var(--hover-bg, rgba(255,255,255,0.07))'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)' } }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? 'var(--card-bg, rgba(255,255,255,0.04))' : 'rgba(255,255,255,0.015)'; e.currentTarget.style.borderColor = active ? 'var(--card-border, rgba(255,255,255,0.08))' : 'rgba(255,255,255,0.03)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', marginBottom: 2 }}>{p.name}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{p.faculty}</div>
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
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 10px', lineHeight: 1.4 }}>
          {p.description.length > 120 ? p.description.slice(0, 120) + '...' : p.description}
        </p>
      )}
      {careers.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {careers.map(c => (
            <span key={c} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 6,
              background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
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
            background: 'rgba(148,163,184,0.1)', color: '#94a3b8',
          }}>
            {s}
          </span>
        ))}
      </div>
    </button>
  )
}
