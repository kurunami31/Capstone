import { useState, useEffect } from 'react'
import './LandingPage.css'

const COOLDOWN_DAYS = 120

function daysUntil(date) {
  const diff = new Date(date) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function LandingPage({ onGetStarted }) {
  const [lastAssessment, setLastAssessment] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  useEffect(() => {
    fetch('/api/assessments/last', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setLastAssessment(data.lastAssessment ? new Date(data.lastAssessment) : null)
        setLoadingStatus(false)
      })
      .catch(() => setLoadingStatus(false))
  }, [])

  const cooldownUntil = lastAssessment
    ? new Date(lastAssessment.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
    : null
  const cooldownDays = cooldownUntil ? daysUntil(cooldownUntil) : 0
  const onCooldown = cooldownDays > 0

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
    }}>
      <div className="hero-fade" style={{
        textAlign: 'center', color: '#fff',
        padding: '60px 24px 0',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 60%)',
      }}>
        <img src="./logo.png" alt="DOrSU Logo" className="hero-logo" style={{ height: 140, marginBottom: 20 }} />
        <h1 style={{
          fontSize: 44, fontWeight: 800, marginBottom: 14,
          letterSpacing: '-0.02em', lineHeight: 1.15,
          background: 'linear-gradient(135deg, #fff 60%, #60a5fa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          DOrSU College Program Recommender
        </h1>
        <p className="hero-sub" style={{
          fontSize: 20, fontWeight: 400, opacity: 0.9,
          margin: '0 auto 8px', lineHeight: 1.6, maxWidth: 600,
        }}>
          Find the best college programs at Davao Oriental State University
          that match your unique strengths and interests.
        </p>
        <p className="hero-tagline" style={{ fontSize: 14, opacity: 0.65, marginBottom: 24, letterSpacing: '0.02em' }}>
          SHS Strand &bull; Grades &bull; Aptitude &bull; Personality &bull; Interests &bull; Skills
        </p>
        {onCooldown ? (
          <div>
            <div style={{
              padding: '14px 24px', borderRadius: 12,
              backgroundColor: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)',
              display: 'inline-block', marginBottom: 8,
            }}>
              <p style={{ color: '#fbbf24', fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>
                Assessment on cooldown
              </p>
              <p style={{ color: '#a3a3a3', fontSize: 13, margin: 0 }}>
                You last took the assessment on {lastAssessment.toLocaleDateString()}.
                You can retake in {cooldownDays} day{cooldownDays === 1 ? '' : 's'}.
              </p>
            </div>
            <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>
              Contact the guidance office if you need to retake sooner.
            </p>
          </div>
        ) : (
          <button
            onClick={onGetStarted}
            disabled={loadingStatus}
            className="hero-cta"
            style={{
              padding: '16px 60px', fontSize: 18, fontWeight: 700,
              backgroundColor: '#2563eb', color: '#fff',
              border: 'none', borderRadius: 12, cursor: loadingStatus ? 'default' : 'pointer',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
              letterSpacing: '0.01em', opacity: loadingStatus ? 0.5 : 1,
            }}
          >
            {loadingStatus ? 'Checking...' : 'Get Started'}
          </button>
        )}
        <div style={{ height: 120 }} />
      </div>

      <div className="section-fade" style={{
        maxWidth: 900, margin: '0 auto', padding: '0 24px 80px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span style={{
            display: 'inline-block', padding: '4px 14px', borderRadius: 20,
            backgroundColor: 'rgba(37,99,235,0.15)', color: '#60a5fa',
            fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            How It Works
          </span>
          <h2 style={{
            fontSize: 30, fontWeight: 700, color: '#f1f5f9', margin: 0,
            letterSpacing: '-0.01em',
          }}>
            Three steps to your future
          </h2>
          <p style={{
            fontSize: 15, color: '#94a3b8', marginTop: 8,
            maxWidth: 480, marginLeft: 'auto', marginRight: 'auto',
          }}>
            A comprehensive assessment that evaluates six dimensions to find your perfect program.
          </p>
        </div>

        <div style={{
          display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {[
            { num: '01', title: 'Your Profile', desc: 'Tell us about your SHS strand, grades, and academic background to establish your foundation.', color: '#3b82f6' },
            { num: '02', title: 'Aptitude & Personality', desc: 'Assess your SUAST performance, Holland personality code, career interests, and skills.', color: '#8b5cf6' },
            { num: '03', title: 'Get Matched', desc: 'Receive a ranked list of compatible programs with match scores and admission chances.', color: '#06b6d4' },
          ].map((s, i) => (
            <div key={s.num} className="step-card" style={{
              flex: '1 1 220px', maxWidth: 260,
              padding: 32, borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(8px)',
              textAlign: 'center', cursor: 'default',
            }}>
              <div className="step-num" style={{
                width: 48, height: 48, borderRadius: 16,
                background: `linear-gradient(135deg, ${s.color}, ${s.color}88)`,
                color: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700, fontSize: 16,
                margin: '0 auto 18px',
              }}>
                {s.num}
              </div>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#f1f5f9', marginBottom: 10 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '28px 24px', textAlign: 'center',
        fontSize: 13, color: '#475569',
      }}>
        Davao Oriental State University &bull; College Program Recommender System
      </div>
    </div>
  )
}
