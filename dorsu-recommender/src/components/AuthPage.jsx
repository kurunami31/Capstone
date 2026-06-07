import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [resetToken, setResetToken] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [middleInitial, setMiddleInitial] = useState('')
  const [extensionName, setExtensionName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      setResetToken(token)
      setMode('reset')
      // Verify token
      fetch(`/api/reset-password/verify?token=${token}`)
        .then(r => r.json())
        .then(data => {
          if (!data.valid) {
            setError('This reset link is invalid or has expired.')
          }
        })
        .catch(() => setError('Failed to verify reset token.'))
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else if (mode === 'register') {
        await register({ firstName, lastName, middleInitial, extensionName, email, password })
      } else if (mode === 'forgot') {
        const res = await fetch('/api/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to send reset email.')
        }
        setForgotSent(true)
      } else if (mode === 'reset') {
        const res = await fetch('/api/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetToken, password: newPassword }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to reset password.')
        }
        setResetDone(true)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = (m) => {
    setMode(m || (mode === 'login' ? 'register' : 'login'))
    setError('')
    setForgotSent(false)
    setResetDone(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        animation: 'fadeInUp 0.6s ease-out both',
      }}>
        <div className="card-padding-mobile" style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 40,
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="./logo.png" alt="DOrSU" style={{ height: 56, marginBottom: 16 }} />
              <h1 style={{
                fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0,
                letterSpacing: '-0.01em',
              }}>
                {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Set New Password'}
              </h1>
              <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 6 }}>
                {mode === 'login' ? 'Sign in to continue to the program recommender.' :
                 mode === 'register' ? 'Register to start your college program assessment.' :
                 mode === 'forgot' && !forgotSent ? 'Enter your email to receive a reset link.' :
                 mode === 'forgot' && forgotSent ? 'Check your email for the reset link.' :
                 mode === 'reset' && !resetDone ? 'Enter your new password.' :
                 'Your password has been reset successfully.'}
              </p>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ animation: 'fadeInUp 0.3s ease-out both' }}>
                <div className="stack-mobile" style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                      First Name
                    </label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)}
                      placeholder="First name" style={inputStyle} autoFocus />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                      Last Name
                    </label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)}
                      placeholder="Last name" style={inputStyle} />
                  </div>
                </div>
                <div className="stack-mobile" style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                      Middle Initial <span style={{ color: '#64748b', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input value={middleInitial} onChange={e => setMiddleInitial(e.target.value)}
                      placeholder="e.g. M" style={inputStyle} maxLength={2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                      Extension <span style={{ color: '#64748b', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input value={extensionName} onChange={e => setExtensionName(e.target.value)}
                      placeholder="e.g. Jr., III" style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
              <div style={{ marginBottom: mode === 'forgot' ? 22 : 18 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={mode === 'register' ? 'DOrSU email or personal email' : 'you@example.com'}
                  style={inputStyle}
                  autoFocus={mode === 'login' || mode === 'forgot'}
                  disabled={forgotSent}
                />
              </div>
            )}

            {mode === 'reset' && (
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  style={inputStyle}
                  autoFocus
                />
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}
                  style={inputStyle}
                />
              </div>
            )}

            {error && (
              <div style={{
                padding: '10px 14px', backgroundColor: 'rgba(220,38,38,0.1)',
                border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8,
                color: '#fca5a5', fontSize: 13, marginBottom: 18, textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || forgotSent}
              style={{
                width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700,
                backgroundColor: '#2563eb', color: '#fff',
                border: 'none', borderRadius: 10, cursor: (submitting || forgotSent) ? 'not-allowed' : 'pointer',
                opacity: (submitting || forgotSent) ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {submitting ? 'Please wait...' :
               mode === 'login' ? 'Sign In' :
               mode === 'register' ? 'Create Account' :
               mode === 'forgot' && !forgotSent ? 'Send Reset Link' :
               mode === 'forgot' && forgotSent ? 'Email Sent' :
               mode === 'reset' && !resetDone ? 'Reset Password' :
               'Done'}
            </button>
          </form>

          {mode === 'login' && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                onClick={() => switchMode('forgot')}
                style={{
                  background: 'none', border: 'none', color: '#60a5fa',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </span>
              <button
                onClick={() => switchMode()}
                style={{
                  background: 'none', border: 'none', color: '#60a5fa',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', marginLeft: 4,
                  textDecoration: 'underline',
                }}
              >
                {mode === 'login' ? 'Register' : 'Sign In'}
              </button>
            </div>
          )}

          {(mode === 'forgot' && !forgotSent) && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                onClick={() => switchMode('login')}
                style={{
                  background: 'none', border: 'none', color: '#94a3b8',
                  fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Back to Sign In
              </button>
            </div>
          )}

          {mode === 'forgot' && forgotSent && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                onClick={() => switchMode('login')}
                style={{
                  background: 'none', border: 'none', color: '#60a5fa',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Back to Sign In
              </button>
            </div>
          )}

          {mode === 'reset' && resetDone && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                onClick={() => switchMode('login')}
                style={{
                  background: '#2563eb', border: 'none', color: '#fff',
                  padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 14px', fontSize: 14,
  backgroundColor: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, color: '#f1f5f9',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}
