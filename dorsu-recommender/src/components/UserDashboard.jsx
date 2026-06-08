import { useState, useEffect } from 'react'
import AchievementBadges from './AchievementBadges.jsx'
import careerTips from '../data/career-tips.json'
import QuickQuiz from './QuickQuiz.jsx'

export default function UserDashboard({ onStartAssessment, onViewHistory }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState([])
  const [showQuiz, setShowQuiz] = useState(false)
  const [consistency, setConsistency] = useState(null)
  const todayTip = careerTips[new Date().getDate() % careerTips.length]

  useEffect(() => {
    fetch('/api/user/summary', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
    fetch('/api/favorites', { credentials: 'include' })
      .then(r => r.json())
      .then(f => setFavorites(f || []))
      .catch(() => {})
    fetch('/api/user/consistency', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.stability !== null) setConsistency(d) })
      .catch(() => {})
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
        background: 'linear-gradient(135deg, #0f172a 0%, var(--table-header) 50%, #0f172a 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, var(--table-header) 50%, #0f172a 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 28px' }}>
          Dashboard
        </h1>

        <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
          <div className="card-padding-mobile" style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 20, padding: 28,
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              {data?.profile?.avatar ? (
                <img src={data.profile.avatar} alt="" style={{
                  width: 48, height: 48, borderRadius: '50%', objectFit: 'cover',
                  border: '2px solid var(--border-strong)',
                }} />
              ) : (
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--border-strong)',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              )}
              <div>
                <div style={{ fontWeight: 600, fontSize: 17, color: 'var(--text-primary)' }}>
                  {data?.profile?.firstName} {data?.profile?.lastName}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{data?.profile?.email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{
                flex: 1, minWidth: 140, padding: 16, borderRadius: 12,
                backgroundColor: 'var(--row-bg)',
                border: '1px solid var(--track-bg)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-text)' }}>{data?.assessmentCount || 0}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Assessments</div>
              </div>
              <div style={{
                flex: 1, minWidth: 140, padding: 16, borderRadius: 12,
                backgroundColor: 'var(--row-bg)',
                border: '1px solid var(--track-bg)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fbbf24' }}>{daysSinceLast !== null ? `${daysSinceLast}d` : '--'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Days Since Last</div>
              </div>
            </div>
          </div>

          <div className="card-padding-mobile" style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 20, padding: 28,
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Assessment Status
              </h2>
              {data?.lastAssessment && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {formatDate(data.lastAssessment.createdAt)}
                </span>
              )}
            </div>

            {!data?.lastAssessment ? (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 16px', lineHeight: 1.5 }}>
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
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 16px', lineHeight: 1.5 }}>
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
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '8px 0 0', lineHeight: 1.4 }}>
                    Assessments can be taken once per semester. You'll be able to retake on{' '}
                    {new Date(Date.now() + daysLeft * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                  </p>
                </div>
                <button onClick={onViewHistory} style={{
                  padding: '12px 24px', fontSize: 14, fontWeight: 600,
                  backgroundColor: 'transparent', color: 'var(--text-secondary)',
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
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 20, padding: 28,
              backdropFilter: 'blur(12px)',
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>
                Top Programs from Last Assessment
              </h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {data.lastAssessment.topPrograms.map((p, i) => (
                  <span key={p.code} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 13,
                    backgroundColor: i === 0 ? 'var(--accent-bg)' : 'var(--track-bg)',
                    color: i === 0 ? 'var(--accent-text)' : 'var(--text-secondary)',
                    border: `1px solid ${i === 0 ? 'rgba(59,130,246,0.25)' : 'var(--card-border)'}`,
                    fontWeight: i === 0 ? 600 : 400,
                  }}>
                    {i === 0 && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent-text)" stroke="var(--accent-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 2, verticalAlign: 'middle' }}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    )}{p.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="card-padding-mobile" style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 20, padding: 28,
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Today's Career Tip
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
              {todayTip}
            </p>
          </div>

          {favorites.length > 0 && (
            <div className="card-padding-mobile" style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 20, padding: 28,
              backdropFilter: 'blur(12px)',
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>
                Saved Programs
              </h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {favorites.map(f => (
                  <span key={f.programCode} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 13,
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    color: 'var(--danger)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    fontWeight: 500,
                  }}>
                    {f.programName}
                  </span>
                ))}
              </div>
            </div>
          )}
          {consistency && (
            <div className="card-padding-mobile" style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 20, padding: 28,
              backdropFilter: 'blur(12px)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: consistency.stability >= 80 ? '#34d399' : consistency.stability >= 50 ? '#fbbf24' : 'var(--danger)' }}>
                {consistency.stability}%
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                Assessment Consistency ({consistency.assessmentCount} assessments)
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.4 }}>
                {consistency.stability >= 80 ? 'Your interests and preferences are very stable.' :
                 consistency.stability >= 50 ? 'Your preferences show some variation across assessments.' :
                 "Your interests seem to be evolving - that's normal!"}
              </p>
            </div>
          )}

          <AchievementBadges />

          <button onClick={() => setShowQuiz(true)} style={{
            padding: '12px 24px', fontSize: 14, fontWeight: 600,
            backgroundColor: 'rgba(139,92,246,0.15)', color: '#a78bfa',
            border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, cursor: 'pointer',
            width: '100%', textAlign: 'center',
          }}>
            Quick Personality Quiz
          </button>
        </div>
      </div>
      {showQuiz && <QuickQuiz onClose={() => setShowQuiz(false)} />}
    </div>
  )
}
