import { useState, useEffect } from 'react'

export default function UserDashboard({ onStartAssessment, onViewHistory }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/summary', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const daysSinceLast = data?.lastAssessment
    ? Math.floor((Date.now() - new Date(data.lastAssessment.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const cooldownDays = 120
  const canTakeAssessment = !data?.lastAssessment || daysSinceLast >= cooldownDays
  const daysLeft = canTakeAssessment ? 0 : cooldownDays - daysSinceLast

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: '#64748b', fontSize: 14 }}>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 28px' }}>
          Dashboard
        </h1>

        <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
          <div className="card-padding-mobile" style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: 28,
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              {data?.profile?.avatar ? (
                <img src={data.profile.avatar} alt="" style={{
                  width: 48, height: 48, borderRadius: '50%', objectFit: 'cover',
                  border: '2px solid rgba(255,255,255,0.1)',
                }} />
              ) : (
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.1)',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: 17, color: '#f1f5f9' }}>
                  {data?.profile?.firstName} {data?.profile?.lastName}
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{data?.profile?.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{
                flex: 1, minWidth: 140, padding: 16, borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#60a5fa' }}>{data?.assessmentCount || 0}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Assessments</div>
              </div>
              <div style={{
                flex: 1, minWidth: 140, padding: 16, borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>{daysSinceLast !== null ? `${daysSinceLast}d` : '--'}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Days Since Last</div>
              </div>
            </div>
          </div>

          <div className="card-padding-mobile" style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: 28,
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
                Assessment Status
              </h2>
              {data?.lastAssessment && (
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {formatDate(data.lastAssessment.createdAt)}
                </span>
              )}
            </div>

            {!data?.lastAssessment ? (
              <div>
                <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 16px', lineHeight: 1.5 }}>
                  You haven't taken an assessment yet. Take your first assessment to discover which programs match your profile.
                </p>
                <button onClick={onStartAssessment} style={{
                  padding: '12px 24px', fontSize: 15, fontWeight: 700,
                  backgroundColor: '#2563eb', color: '#fff', border: 'none',
                  borderRadius: 10, cursor: 'pointer',
                }}>
                  Start Assessment
                </button>
              </div>
            ) : canTakeAssessment ? (
              <div>
                <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 16px', lineHeight: 1.5 }}>
                  Your cooldown period has ended. You may take another assessment to get updated recommendations.
                </p>
                <button onClick={onStartAssessment} style={{
                  padding: '12px 24px', fontSize: 15, fontWeight: 700,
                  backgroundColor: '#2563eb', color: '#fff', border: 'none',
                  borderRadius: 10, cursor: 'pointer',
                }}>
                  Retake Assessment
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  padding: '14px 18px', borderRadius: 12,
                  backgroundColor: 'rgba(234,179,8,0.08)',
                  border: '1px solid rgba(234,179,8,0.15)',
                  marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span style={{ color: '#fbbf24', fontSize: 14, fontWeight: 600 }}>
                      Cooldown: {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                    </span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: 13, margin: '8px 0 0', lineHeight: 1.4 }}>
                    Assessments can be taken once per semester. You'll be able to retake on{' '}
                    {new Date(Date.now() + daysLeft * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                  </p>
                </div>
                <button onClick={onViewHistory} style={{
                  padding: '12px 24px', fontSize: 14, fontWeight: 600,
                  backgroundColor: 'transparent', color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10, cursor: 'pointer',
                }}>
                  View History
                </button>
              </div>
            )}
          </div>

          {data?.lastAssessment && data.lastAssessment.topPrograms?.length > 0 && (
            <div className="card-padding-mobile" style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: 28,
              backdropFilter: 'blur(12px)',
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px' }}>
                Top Programs from Last Assessment
              </h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {data.lastAssessment.topPrograms.map((p, i) => (
                  <span key={p.code} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 13,
                    backgroundColor: i === 0 ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)',
                    color: i === 0 ? '#60a5fa' : '#94a3b8',
                    border: `1px solid ${i === 0 ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    fontWeight: i === 0 ? 600 : 400,
                  }}>
                    {i === 0 && '★ '}{p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
