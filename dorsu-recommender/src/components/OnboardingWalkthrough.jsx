import { useState, useEffect } from 'react'

const STORAGE_KEY = 'dorsu_onboarding_done'
const STEPS = [
  {
    title: 'Welcome to the Recommender',
    body: 'This system helps you find the best college programs at DOrSU based on your unique strengths and interests.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    title: 'Complete the Assessment',
    body: 'Go through 7 steps: your profile, strand, grades, aptitude test, personality quiz, interests, and skills. The whole process takes about 15–20 minutes.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    title: 'Get Your Results',
    body: 'After completing the assessment, you\'ll receive a ranked list of recommended programs with match scores and admission chances. You can also download a PDF report.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
]

export default function OnboardingWalkthrough() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 480)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) setVisible(true)
    const mq = window.matchMedia('(max-width: 480px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  const s = STEPS[step]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: isMobile ? 16 : 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        backgroundColor: 'var(--modal-bg)', borderRadius: 20, padding: isMobile ? 20 : 32, maxWidth: 380, width: '100%',
        border: '1px solid var(--card-border)',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: 12 }}>{s.icon}</div>
        <h3 style={{ color: 'var(--text-primary)', fontSize: isMobile ? 16 : 18, fontWeight: 700, margin: '0 0 8px' }}>{s.title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? 13 : 14, margin: '0 0 20px', lineHeight: 1.6 }}>{s.body}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: i === step ? '#3b82f6' : 'rgba(255,255,255,0.15)',
              transition: 'background-color 0.2s',
            }} />
          ))}
        </div>
        <div style={{
          display: 'flex', gap: 8,
          flexDirection: isMobile ? 'column-reverse' : 'row',
          justifyContent: isMobile ? 'stretch' : 'flex-end',
        }}>
          <button onClick={dismiss} style={{
            padding: isMobile ? '10px 16px' : '8px 16px',
            borderRadius: 10, border: '1px solid var(--border-strong)',
            backgroundColor: 'transparent', color: 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Skip Tour
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} style={{
              padding: isMobile ? '10px 16px' : '8px 20px',
              borderRadius: 10, border: 'none',
              backgroundColor: '#2563eb', color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Next
            </button>
          ) : (
            <button onClick={dismiss} style={{
              padding: isMobile ? '10px 16px' : '8px 20px',
              borderRadius: 10, border: 'none',
              backgroundColor: '#2563eb', color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Got it!
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
