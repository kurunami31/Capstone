import { useState, useEffect } from 'react'
import SkeletonLoader from './SkeletonLoader.jsx'
import { calculateRecommendations } from '../engine/scoring.js'
import programs from '../data/programs.json'

function codeColor(score) {
  if (score >= 80) return '#34d399'
  if (score >= 60) return '#fbbf24'
  return '#f87171'
}

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [expandedId, setExpandedId] = useState(null)
  const [details, setDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [strandFilter, setStrandFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const limit = 20

  useEffect(() => {
    setLoading(true)
    fetch(`/api/assessments/history?page=${page}&limit=${limit}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setHistory(data.history || []); setTotal(data.total || 0); setLoading(false) })
      .catch(() => setLoading(false))
  }, [page])

  const standardStrands = ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL']
  const uniqueStrands = [...new Set(history.map(e => e.strand).filter(Boolean))].filter(s => standardStrands.includes(s))

  const filtered = history.filter(entry => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const matchName = entry.topPrograms.some(p => p.name.toLowerCase().includes(term))
      if (!matchName) return false
    }
    if (strandFilter && entry.strand !== strandFilter) return false
    if (dateFilter) {
      const days = parseInt(dateFilter)
      const cutoff = new Date(Date.now() - days * 86400000)
      if (new Date(entry.createdAt) < cutoff) return false
    }
    return true
  })

  const totalPages = Math.ceil(total / limit)

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null)
      setDetails(null)
      return
    }
    setExpandedId(id)
    setDetails(null)
    setDetailsLoading(true)
    try {
      const res = await fetch(`/api/assessments/${id}/details`, { credentials: 'include' })
      const data = await res.json()
      if (data.fullData) {
        const studentData = {
          ...data.fullData,
          name: '',
          school: '',
          grades: data.fullData.grades || {},
          strandSpecificGrades: data.fullData.strandSpecificGrades || {},
          suastTiers: data.fullData.suastTiers || {},
          hollandCode: data.fullData.hollandCode,
          interests: data.fullData.interests || {},
          skills: data.fullData.skills || {},
          gwa: data.fullData.gwa || data.gwa || 0,
          strand: data.fullData.strand || data.strand || '',
        }
        const recommendations = calculateRecommendations(studentData, programs)
        setDetails({ recommendations, fullData: true })
      } else {
        setDetails({ topPrograms: data.topPrograms, fullData: false })
      }
    } catch {
      setDetails({ topPrograms: [], fullData: false })
    } finally {
      setDetailsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, var(--table-header) 50%, #0f172a 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Assessment History
          </h1>
          {!loading && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{total} total</span>}
        </div>

        {!loading && history.length > 0 && (
          <div style={{
            display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap',
            padding: 12, backgroundColor: 'var(--row-bg)',
            borderRadius: 12, border: '1px solid var(--track-bg)',
          }}>
            <input
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by program name..."
              style={{
                flex: 1, minWidth: 160, padding: '8px 12px', fontSize: 13,
                backgroundColor: 'var(--track-bg)', border: '1px solid var(--border-strong)',
                borderRadius: 6, color: 'var(--text-primary)', outline: 'none',
              }}
            />
            <select
              value={strandFilter} onChange={e => setStrandFilter(e.target.value)}
              style={{
                padding: '8px 12px', fontSize: 13, minWidth: 100,
                backgroundColor: 'var(--track-bg)', border: '1px solid var(--border-strong)',
                borderRadius: 6, color: 'var(--text-primary)', outline: 'none',
              }}
            >
              <option value="" style={{ color: '#1e293b' }}>All Strands</option>
              {uniqueStrands.map(s => <option key={s} value={s} style={{ color: '#1e293b' }}>{s}</option>)}
            </select>
            <select
              value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              style={{
                padding: '8px 12px', fontSize: 13, minWidth: 100,
                backgroundColor: 'var(--track-bg)', border: '1px solid var(--border-strong)',
                borderRadius: 6, color: 'var(--text-primary)', outline: 'none',
              }}
            >
              <option value="">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                backgroundColor: 'var(--card-bg)', borderRadius: 14, padding: 20,
                border: '1px solid var(--track-bg)',
              }}>
                <SkeletonLoader height={16} width="50%" style={{ marginBottom: 8 }} />
                <SkeletonLoader height={12} width="30%" style={{ marginBottom: 12 }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <SkeletonLoader height={22} width={80} borderRadius={20} />
                  <SkeletonLoader height={22} width={100} borderRadius={20} />
                  <SkeletonLoader height={22} width={60} borderRadius={20} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--card-bg)', borderRadius: 16, padding: 40,
            border: '1px solid var(--track-bg)', textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No assessments taken yet.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(entry => (
                <div key={entry.id} style={{
                  backgroundColor: 'var(--card-bg)', borderRadius: 14,
                  border: '1px solid var(--track-bg)', backdropFilter: 'blur(8px)',
                  overflow: 'hidden',
                }}>
                  <div
                    onClick={() => toggleExpand(entry.id)}
                    style={{
                      padding: 20, cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                        <span>Strand: {entry.strand || 'N/A'}</span>
                        <span>GWA: {entry.gwa || 'N/A'}</span>
                        {entry.hollandCode && <span>Holland: {entry.hollandCode}</span>}
                      </div>
                      {entry.topPrograms.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {entry.topPrograms.map((p, i) => (
                              <span key={p.code} style={{
                                fontSize: 11, padding: '3px 10px', borderRadius: 20,
                                backgroundColor: i === 0 ? 'var(--accent-bg)' : 'var(--track-bg)',
                                color: i === 0 ? 'var(--accent-text)' : 'var(--text-secondary)',
                                border: `1px solid ${i === 0 ? 'rgba(59,130,246,0.25)' : 'var(--card-border)'}`,
                              }}>
                                {p.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{
                      transform: expandedId === entry.id ? 'rotate(180deg)' : '',
                      transition: 'transform 0.2s', color: 'var(--text-muted)', flexShrink: 0, marginLeft: 12,
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </div>

                  {expandedId === entry.id && (
                    <div style={{
                      borderTop: '1px solid var(--track-bg)',
                      padding: '16px 20px 20px',
                    }}>
                      {detailsLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <SkeletonLoader height={14} width="40%" />
                          <SkeletonLoader height={14} width="60%" />
                          <SkeletonLoader height={14} width="50%" />
                        </div>
                      ) : details?.fullData && details.recommendations?.length > 0 ? (
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                            Full Score Breakdown
                          </div>
                          <div style={{ display: 'grid', gap: 8 }}>
                            {details.recommendations.map((r) => (
                              <div key={r.program.code} style={{
                                backgroundColor: 'var(--row-bg)',
                                borderRadius: 10, padding: '10px 14px',
                                border: '1px solid var(--card-bg)',
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    <span style={{
                                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                      width: 20, height: 20, borderRadius: '50%', fontSize: 11,
                                      backgroundColor: codeColor(r.totalScore), color: '#0f172a',
                                      fontWeight: 700, marginRight: 8,
                                    }}>{r.rank}</span>
                                    {r.program.name}
                                  </div>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: codeColor(r.totalScore) }}>
                                    {r.totalScore}%
                                  </div>
                                </div>
                                <div style={{
                                  height: 4, borderRadius: 2, backgroundColor: 'var(--track-bg)',
                                  marginBottom: 8, overflow: 'hidden',
                                }}>
                                  <div style={{
                                    width: `${r.totalScore}%`, height: '100%',
                                    backgroundColor: codeColor(r.totalScore),
                                    borderRadius: 2, transition: 'width 0.5s ease',
                                  }} />
                                </div>
                                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                                  <span>Academic: {r.breakdown.academic}%</span>
                                  <span>SUAST: {r.breakdown.suast}%</span>
                                  <span>Personal: {r.breakdown.personalFit}%</span>
                                  <span style={{ color: r.admission.color }}>Admission: {r.admission.label}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                          Detailed score breakdown is not available for this assessment. Top programs: {details?.topPrograms?.map(p => p.name).join(', ') || 'N/A'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: page <= 1 ? 'default' : 'pointer',
                    background: 'var(--track-bg)', border: '1px solid var(--border-strong)',
                    color: 'var(--text-secondary)', opacity: page <= 1 ? 0.4 : 1,
                  }}
                >Previous</button>
                <span style={{ color: 'var(--text-muted)', fontSize: 12, padding: '6px 0' }}>Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: page >= totalPages ? 'default' : 'pointer',
                    background: 'var(--track-bg)', border: '1px solid var(--border-strong)',
                    color: 'var(--text-secondary)', opacity: page >= totalPages ? 0.4 : 1,
                  }}
                >Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
