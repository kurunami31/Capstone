import { useState, useEffect } from 'react'
import programs from '../data/programs.json'

const CARD = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 16,
  backdropFilter: 'blur(8px)',
}

const INPUT = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  padding: '8px 12px',
  color: '#e2e8f0',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
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

export default function ProgramsPage({ activePrograms }) {
  const [localActivePrograms, setLocalActivePrograms] = useState({})
  const [programModal, setProgramModal] = useState(null)
  const [programForm, setProgramForm] = useState({ code: '', name: '', college: '', description: '' })
  const [programError, setProgramError] = useState('')
  const [editingProgram, setEditingProgram] = useState(null)

  useEffect(() => {
    setLocalActivePrograms(activePrograms || {})
  }, [activePrograms])

  async function fetchProgramStatus() {
    try {
      const res = await fetch('/api/programs/status', { credentials: 'include' })
      if (res.ok) setLocalActivePrograms(await res.json())
    } catch {}
  }

  async function fetchActivityLog() {
    try {
      await fetch('/api/admin/activity?page=1&limit=1', { credentials: 'include' })
    } catch {}
  }

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Programs</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Toggle programs on/off for recommendations</span>
            <button onClick={() => {
              setProgramForm({ code: '', name: '', college: '', description: '' })
              setProgramModal('create')
            }} style={{
              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
              color: '#4ade80', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              + Add Program
            </button>
            <button onClick={() => window.open('/api/admin/assessments/export', '_blank')} style={{
              ...BTN_SECONDARY, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export Assessments
            </button>
          </div>
        </div>
        <div style={{ ...CARD, padding: 20 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            {programs.map(prog => {
              const active = localActivePrograms[prog.code] !== false
              return (
                <div key={prog.code} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 10,
                  background: active ? 'rgba(34,197,94,0.06)' : 'rgba(248,113,113,0.06)',
                  border: `1px solid ${active ? 'rgba(34,197,94,0.15)' : 'rgba(248,113,113,0.15)'}`,
                }}>
                  <div>
                    <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>{prog.name}</div>
                    <div style={{ color: '#64748b', fontSize: 11 }}>{prog.code} — {prog.college}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/admin/programs/${prog.code}/toggle`, { method: 'PUT', credentials: 'include' })
                          if (res.ok) {
                            const data = await res.json()
                            setLocalActivePrograms(prev => ({ ...prev, [data.code]: data.active }))
                            fetchActivityLog()
                          }
                        } catch {}
                      }}
                      style={{
                        padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 600,
                        background: active ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                        color: active ? '#f87171' : '#4ade80',
                      }}
                    >
                      {active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => {
                        setProgramForm({ code: prog.code, name: prog.name, college: prog.college, description: prog.description || '' })
                        setEditingProgram(prog.code)
                        setProgramModal('edit')
                      }}
                      style={{
                        padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.3)',
                        background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete program "${prog.name}"? This cannot be undone.`)) return
                        try {
                          const res = await fetch(`/api/admin/programs/${prog.code}`, { method: 'DELETE', credentials: 'include' })
                          if (res.ok) {
                            fetchProgramStatus()
                            fetchActivityLog()
                          }
                        } catch {}
                      }}
                      style={{
                        padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(248,113,113,0.3)',
                        background: 'rgba(248,113,113,0.1)', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {programModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: '#1e293b', borderRadius: 16, padding: 28, maxWidth: 450, width: '100%',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}>
            <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>
              {programModal === 'create' ? 'Add Program' : 'Edit Program'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={programForm.code} onChange={e => setProgramForm(p => ({ ...p, code: e.target.value }))}
                placeholder="Program Code (e.g. BSIT)" style={INPUT} disabled={programModal === 'edit'} />
              <input value={programForm.name} onChange={e => setProgramForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Program Name" style={INPUT} />
              <input value={programForm.college} onChange={e => setProgramForm(p => ({ ...p, college: e.target.value }))}
                placeholder="College" style={INPUT} />
              <textarea value={programForm.description} onChange={e => setProgramForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Description (optional)" rows={3} style={{ ...INPUT, resize: 'vertical' }} />
            </div>
            {programError && (
              <div style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{programError}</div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => { setProgramModal(null); setProgramError('') }} style={{
                ...BTN_SECONDARY, padding: '8px 16px', fontSize: 13,
              }}>Cancel</button>
              <button onClick={async () => {
                try {
                  if (!programForm.code || !programForm.name) {
                    setProgramError('Code and name are required.')
                    return
                  }
                  const url = programModal === 'create' ? '/api/admin/programs' : `/api/admin/programs/${editingProgram}`
                  const method = programModal === 'create' ? 'POST' : 'PUT'
                  const res = await fetch(url, {
                    method, credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(programForm),
                  })
                  if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.error || 'Save failed')
                  }
                  setProgramModal(null)
                  setProgramError('')
                  fetchProgramStatus()
                  fetchActivityLog()
                } catch (e) {
                  setProgramError(e.message)
                }
              }} style={{
                background: '#2563eb', border: 'none', color: '#fff',
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                {programModal === 'create' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
