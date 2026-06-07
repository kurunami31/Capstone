import { useState, useEffect } from 'react'

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/assessments/history', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setHistory(data.history || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

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
          <div style={{ color: '#64748b', textAlign: 'center', padding: 40, fontSize: 14 }}>Loading...</div>
        ) : history.length === 0 ? (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 40,
            border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
          }}>
            <p style={{ color: '#64748b', fontSize: 14 }}>No assessments taken yet.</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
