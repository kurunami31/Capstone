import { useState, useEffect } from 'react'
import SkeletonLoader from './SkeletonLoader.jsx'

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    setLoading(true)
    fetch(`/api/assessments/history?page=${page}&limit=${limit}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setHistory(data.history || []); setTotal(data.total || 0); setLoading(false) })
      .catch(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / limit)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 28px' }}>
          Assessment History
        </h1>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 20,
                border: '1px solid rgba(255,255,255,0.06)',
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
        ) : history.length === 0 ? (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 40,
            border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
          }}>
            <p style={{ color: '#64748b', fontSize: 14 }}>No assessments taken yet.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {history.map(entry => (
                <div key={entry.id} style={{
                  backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 20,
                  border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748b' }}>
                        <span>Strand: {entry.strand || 'N/A'}</span>
                        <span>GWA: {entry.gwa || 'N/A'}</span>
                        {entry.hollandCode && <span>Holland: {entry.hollandCode}</span>}
                      </div>
                    </div>
                  </div>
                  {entry.topPrograms.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Top Results</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {entry.topPrograms.map((p, i) => (
                          <span key={p.code} style={{
                            fontSize: 11, padding: '3px 10px', borderRadius: 20,
                            backgroundColor: i === 0 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)',
                            color: i === 0 ? '#60a5fa' : '#94a3b8',
                            border: `1px solid ${i === 0 ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.08)'}`,
                          }}>
                            {p.name}
                          </span>
                        ))}
                      </div>
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
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8', opacity: page <= 1 ? 0.4 : 1,
                  }}
                >Previous</button>
                <span style={{ color: '#64748b', fontSize: 12, padding: '6px 0' }}>Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
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
    </div>
  )
}