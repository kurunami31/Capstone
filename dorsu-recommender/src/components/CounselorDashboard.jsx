import { useState, useEffect } from 'react'

const CARD = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 16,
  backdropFilter: 'blur(8px)',
}

export default function CounselorDashboard() {
  const [assessments, setAssessments] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [editNotes, setEditNotes] = useState('')
  const [editStatus, setEditStatus] = useState('pending')
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  const fetchAssessments = async (p) => {
    try {
      const res = await fetch(`/api/counselor/assessments?page=${p || page}&limit=${limit}`, { credentials: 'include' })
      const data = await res.json()
      setAssessments(data.assessments || [])
      setTotal(data.total || 0)
    } catch {}
  }

  useEffect(() => { fetchAssessments(1) }, [])

  const saveNote = async (assessmentId) => {
    setSaving(true)
    try {
      await fetch('/api/counselor/notes', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, notes: editNotes, status: editStatus }),
      })
      await fetchAssessments(page)
    } catch {}
    setSaving(false)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div style={{ ...CARD, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Student Assessments</h2>
        <button onClick={() => fetchAssessments(page)} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#94a3b8', padding: '5px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
        }}>
          Refresh
        </button>
      </div>

      {assessments.length === 0 ? (
        <div style={{ color: '#475569', fontSize: 13, padding: 20, textAlign: 'center' }}>No assessments found.</div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {assessments.map(a => (
              <div key={a.id} style={{
                borderRadius: 10, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div
                  onClick={() => {
                    if (expandedId === a.id) { setExpandedId(null); return }
                    setExpandedId(a.id)
                    setEditNotes(a.notes || '')
                    setEditStatus(a.reviewStatus || 'pending')
                  }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px', cursor: 'pointer',
                    backgroundColor: expandedId === a.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <div>
                    <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }}>{a.studentName}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{a.email} — {a.strand || 'No strand'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 600,
                      backgroundColor: a.reviewStatus === 'reviewed' ? 'rgba(34,197,94,0.15)' :
                        a.reviewStatus === 'in_progress' ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.06)',
                      color: a.reviewStatus === 'reviewed' ? '#4ade80' :
                        a.reviewStatus === 'in_progress' ? '#fbbf24' : '#64748b',
                    }}>
                      {a.reviewStatus.replace('_', ' ')}
                    </span>
                    <span style={{ color: '#64748b', fontSize: 11 }}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {expandedId === a.id && (
                  <div style={{ padding: '0 16px 16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>GWA</div>
                        <div style={{ color: '#e2e8f0', fontSize: 13 }}>{a.gwa || 'N/A'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Holland Code</div>
                        <div style={{ color: '#e2e8f0', fontSize: 13 }}>{a.hollandCode || 'N/A'}</div>
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Top Programs</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {a.topPrograms.map((p, i) => (
                          <span key={p.code} style={{
                            fontSize: 11, padding: '2px 8px', borderRadius: 6,
                            backgroundColor: i === 0 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)',
                            color: i === 0 ? '#60a5fa' : '#94a3b8',
                          }}>{p.name}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>Notes</label>
                      <textarea
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        placeholder="Add counselor notes..."
                        rows={3}
                        style={{
                          width: '100%', padding: '8px 10px', fontSize: 13,
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8, color: '#e2e8f0', outline: 'none', resize: 'vertical',
                          fontFamily: 'inherit', boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value)}
                        style={{
                          padding: '6px 10px', fontSize: 12,
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 8, color: '#e2e8f0', outline: 'none',
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="reviewed">Reviewed</option>
                      </select>
                      <button onClick={() => saveNote(a.id)} disabled={saving} style={{
                        padding: '6px 14px', borderRadius: 8, border: 'none',
                        background: '#2563eb', color: '#fff', fontSize: 12, fontWeight: 600, cursor: saving ? 'default' : 'pointer',
                        opacity: saving ? 0.6 : 1,
                      }}>
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      {a.noteUpdatedAt && (
                        <span style={{ color: '#64748b', fontSize: 10 }}>
                          Last updated: {new Date(a.noteUpdatedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => { const np = p - 1; fetchAssessments(np); return np })}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: page <= 1 ? 'default' : 'pointer',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', opacity: page <= 1 ? 0.4 : 1,
                }}
              >Previous</button>
              <span style={{ color: '#64748b', fontSize: 12, padding: '6px 0' }}>Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => { const np = p + 1; fetchAssessments(np); return np })}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: page >= totalPages ? 'default' : 'pointer',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', opacity: page >= totalPages ? 0.4 : 1,
                }}
              >Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}