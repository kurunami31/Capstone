import { useState, useEffect } from 'react'
import useMobile from '../hooks/useMobile.js'
import programs from '../data/programs.json'

const CARD = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--track-bg)',
  borderRadius: 16,
  backdropFilter: 'blur(8px)',
}

const INPUT = {
  background: 'var(--track-bg)',
  border: '1px solid var(--border-strong)',
  borderRadius: 8,
  padding: '8px 12px',
  color: 'var(--text-input)',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const BTN_SECONDARY = {
  background: 'var(--track-bg)',
  border: '1px solid var(--border-strong)',
  color: 'var(--text-secondary)',
  padding: '8px 16px',
  borderRadius: 8,
  fontSize: 13,
  cursor: 'pointer',
}

export default function ProgramsPage({ activePrograms }) {
  const isMobile = useMobile()
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
    } catch (e) { console.error('Fetch programs error:', e) }
  }

  async function fetchActivityLog() {
    try {
      await fetch('/api/admin/activity?page=1&limit=1', { credentials: 'include' })
    } catch (e) { console.error('Activity log error:', e) }
  }

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, var(--table-header) 50%, #0f172a 100%)',
    }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 60px' }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          marginBottom: 16, gap: isMobile ? 8 : 0,
        }}>
          <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Programs</h1>
          <div style={{
            display: 'flex', gap: 6,
            flexWrap: 'wrap', alignItems: 'center',
          }}>
            {!isMobile && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Toggle programs on/off for recommendations</span>
            )}
            <button onClick={() => {
              setProgramForm({ code: '', name: '', college: '', description: '' })
              setProgramModal('create')
            }} style={{
              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
              color: '#4ade80', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>
              + Add Program
            </button>
            <button onClick={() => window.open('/api/admin/assessments/export', '_blank')} style={{
              ...BTN_SECONDARY, display: 'flex', alignItems: 'center', gap: 6,
              whiteSpace: isMobile ? 'normal' : 'nowrap',
              padding: isMobile ? '6px 10px' : undefined,
              fontSize: isMobile ? 11 : undefined,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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
                    <div style={{ color: 'var(--text-input)', fontSize: 14, fontWeight: 600 }}>{prog.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{prog.code} — {prog.college}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      onClick={async () => {
                        if (active && !confirm(`Disable "${prog.name}"? It will no longer be recommended.`)) return
                        try {
                          const res = await fetch(`/api/admin/programs/${prog.code}/toggle`, { method: 'PUT', credentials: 'include' })
                          if (res.ok) {
                            const data = await res.json()
                            setLocalActivePrograms(prev => ({ ...prev, [data.code]: data.active }))
                            fetchActivityLog()
                          }
                          } catch (e) { console.error('Toggle program error:', e) }
                      }}
                      style={{
                        padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 600,
                        background: active ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                        color: active ? 'var(--danger)' : '#4ade80',
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
                        background: 'var(--accent-bg)', color: 'var(--accent-text)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
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
                        } catch (e) { console.error('Delete program error:', e) }
                      }}
                      style={{
                        padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(248,113,113,0.3)',
                        background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
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
            background: 'var(--modal-bg)', borderRadius: 16, padding: 28, maxWidth: 450, width: '100%',
            border: '1px solid var(--card-border)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}>
            <h3 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>
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
              <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>{programError}</div>
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
