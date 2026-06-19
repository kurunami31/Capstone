import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

function getStrength(pw) {
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^a-zA-Z0-9]/.test(pw)) s++
  return s
}

function strengthLabel(score) {
  if (score <= 1) return { label: 'Weak', color: '#f87171', pct: 25 }
  if (score <= 2) return { label: 'Fair', color: '#fbbf24', pct: 50 }
  if (score <= 3) return { label: 'Good', color: '#60a5fa', pct: 75 }
  return { label: 'Strong', color: '#34d399', pct: 100 }
}

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
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [oauthOnlyError, setOauthOnlyError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const [tokenExpired, setTokenExpired] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [redirectCountdown, setRedirectCountdown] = useState(0)
  const [smtpConfigured, setSmtpConfigured] = useState(true)
  const [oauthProviders, setOauthProviders] = useState({})
  const [devLink, setDevLink] = useState('')
  const cooldownRef = useRef(null)
  const redirectRef = useRef(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const path = window.location.pathname

    if (token && path.includes('/verify-email')) {
      fetch(`/api/verify-email?token=${token}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setMode('verify')
            window.history.replaceState({}, document.title, '/')
          } else {
            setError(data.error || 'Verification failed.')
          }
        })
        .catch(() => setError('Failed to verify email.'))
    } else if (token) {
      setResetToken(token)
      setMode('reset')
      fetch(`/api/reset-password/verify?token=${token}`)
        .then(r => r.json())
        .then(data => {
          if (!data.valid) {
            setTokenExpired(true)
            setError('This reset link is invalid or has expired.')
          }
        })
        .catch(() => setError('Failed to verify reset token.'))
    }

    fetch('/api/check-smtp')
      .then(r => r.json())
      .then(d => setSmtpConfigured(d.configured))
      .catch(() => {})
    fetch('/api/auth/providers')
      .then(r => r.json())
      .then(d => setOauthProviders(d))
      .catch(() => {})

    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
      if (redirectRef.current) clearInterval(redirectRef.current)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'login') {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, rememberMe }),
        })
        const data = await res.json()
        if (data.oauthOnly) {
          setOauthOnlyError(true)
          throw new Error(data.error)
        }
        if (!res.ok) throw new Error(data.error || 'Login failed')
        window.location.reload()
      } else if (mode === 'register') {
        await register({ firstName, lastName, middleInitial, extensionName, email, password })
      } else if (mode === 'forgot') {
        const res = await fetch('/api/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to send reset email.')
        setForgotSent(true)
        if (data.cooldown) {
          setCooldown(data.cooldown)
        }
        if (data.devLink) {
          setDevLink(data.devLink)
        }
      } else if (mode === 'reset') {
        if (confirmPassword !== newPassword) {
          throw new Error('Passwords do not match.')
        }
        const res = await fetch('/api/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetToken, password: newPassword }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to reset password.')
        setResetDone(true)
        setRedirectCountdown(5)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (cooldown > 0 && !cooldownRef.current) {
      cooldownRef.current = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(cooldownRef.current)
            cooldownRef.current = null
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }, [forgotSent])

  useEffect(() => {
    if (redirectCountdown > 0 && !redirectRef.current) {
      redirectRef.current = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(redirectRef.current)
            redirectRef.current = null
            switchMode('login')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }, [resetDone])

  const switchMode = (m) => {
    setMode(m || (mode === 'login' ? 'register' : 'login'))
    setError('')
    setOauthOnlyError(false)
    setForgotSent(false)
    setResetDone(false)
    setTokenExpired(false)
    setRedirectCountdown(0)
    setCooldown(0)
    setDevLink('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, var(--table-header) 50%, #0f172a 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        animation: 'fadeInUp 0.6s ease-out both',
      }}>
        <div className="card-padding-mobile" style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 20, padding: 40,
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src="./logo.png" alt="DOrSU" style={{ height: 56, marginBottom: 16 }} />
              <h1 style={{
                fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0,
                letterSpacing: '-0.01em',
              }}>
                {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : mode === 'verify' ? 'Email Verified' : 'Set New Password'}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
                {mode === 'login' ? 'Sign in to continue to the program recommender.' :
                 mode === 'register' ? 'Register to start your college program assessment.' :
                 mode === 'forgot' && !smtpConfigured ? 'The email system is not configured. A reset link will appear on screen instead.' :
                 mode === 'forgot' && !forgotSent ? 'Enter your email to receive a reset link.' :
                 mode === 'forgot' && forgotSent ? 'Check your email for the reset link.' :
                 mode === 'verify' ? error || 'Your email has been verified! You can now sign in.' :
                 mode === 'reset' && tokenExpired ? error || 'This link has expired.' :
                 mode === 'reset' && !resetDone ? 'Enter your new password.' :
                 'Your password has been reset successfully.'}
              </p>
          </div>

          {(mode === 'login' && (oauthProviders.google || oauthProviders.github || oauthOnlyError)) && (
            <div style={{ marginBottom: 20 }}>
              {oauthOnlyError && (
                <div style={{
                  marginBottom: 14, padding: '10px 14px', textAlign: 'center',
                  backgroundColor: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8,
                  color: '#fbbf24', fontSize: 13, lineHeight: 1.5,
                }}>
                  This account uses Google/GitHub. Sign in with your OAuth provider, or set a password via <button onClick={() => switchMode('forgot')} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Forgot Password</button>.
                </div>
              )}
              {oauthProviders.google && (
                <a href="/api/auth/google" style={{ textDecoration: 'none', display: 'block' }}>
                  <button type="button" style={{
                    width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 600,
                    backgroundColor: '#fff', color: '#333',
                    border: '1px solid #dadce0', borderRadius: 10, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'all 0.2s', marginBottom: oauthProviders.github ? 10 : 0,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
                    Continue with Google
                  </button>
                </a>
              )}
              {oauthProviders.github && (
                <a href="/api/auth/github" style={{ textDecoration: 'none', display: 'block' }}>
                  <button type="button" style={{
                    width: '100%', padding: '12px 0', fontSize: 14, fontWeight: 600,
                    backgroundColor: '#24292F', color: '#fff',
                    border: '1px solid #1b1f23', borderRadius: 10, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    transition: 'all 0.2s',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                    Continue with GitHub
                  </button>
                </a>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
                <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-color)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>or</span>
                <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border-color)' }} />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ animation: 'fadeInUp 0.3s ease-out both' }}>
                <div className="stack-mobile" style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>
                      First Name
                    </label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)}
                      placeholder="First name" style={inputStyle} autoFocus />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>
                      Last Name
                    </label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)}
                      placeholder="Last name" style={inputStyle} />
                  </div>
                </div>
                <div className="stack-mobile" style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>
                      Middle Initial <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input value={middleInitial} onChange={e => setMiddleInitial(e.target.value)}
                      placeholder="e.g. M" style={inputStyle} maxLength={2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>
                      Extension <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input value={extensionName} onChange={e => setExtensionName(e.target.value)}
                      placeholder="e.g. Jr., III" style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
              <div style={{ marginBottom: mode === 'forgot' ? 22 : 18 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>
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

            {mode === 'reset' && !resetDone && !tokenExpired && (
              <>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      style={{ ...inputStyle, paddingRight: 40 }}
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                      color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                    }}>
                      {showPwd ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {newPassword && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ height: 4, backgroundColor: 'var(--track-bg)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${strengthLabel(getStrength(newPassword)).pct}%`,
                          backgroundColor: strengthLabel(getStrength(newPassword)).color,
                          borderRadius: 2, transition: 'all 0.3s',
                        }} />
                      </div>
                      <div style={{ fontSize: 11, color: strengthLabel(getStrength(newPassword)).color, marginTop: 3 }}>
                        {strengthLabel(getStrength(newPassword)).label}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>
                    Confirm Password
                  </label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            {mode === 'reset' && tokenExpired && (
              <div style={{ textAlign: 'center', marginBottom: 22 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  backgroundColor: 'rgba(251,191,36,0.1)', color: '#fbbf24',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', fontSize: 28,
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  This reset link has expired. Please request a new one.
                </p>
                <button
                  onClick={() => switchMode('forgot')}
                  style={{
                    padding: '10px 24px', fontSize: 14, fontWeight: 600,
                    backgroundColor: '#2563eb', color: '#fff',
                    border: 'none', borderRadius: 8, cursor: 'pointer',
                  }}
                >
                  Request New Link
                </button>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}
                    style={{ ...inputStyle, paddingRight: 40 }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                  }}>
                    {showPwd ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{
                    width: 16, height: 16, cursor: 'pointer', accentColor: '#3b82f6', margin: 0,
                  }}
                />
                <label htmlFor="rememberMe" style={{
                  fontSize: 13, color: 'var(--text-secondary, #94a3b8)', cursor: 'pointer', userSelect: 'none',
                }}>
                  Remember me
                </label>
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
              disabled={submitting || forgotSent || (mode === 'forgot' && cooldown > 0)}
              style={{
                width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700,
                backgroundColor: '#2563eb', color: '#fff',
                border: 'none', borderRadius: 10, cursor: (submitting || forgotSent || (mode === 'forgot' && cooldown > 0)) ? 'not-allowed' : 'pointer',
                opacity: (submitting || forgotSent || (mode === 'forgot' && cooldown > 0)) ? 0.6 : 1,
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
                  background: 'none', border: 'none', color: 'var(--accent-text)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </span>
              <button
                onClick={() => switchMode()}
                style={{
                  background: 'none', border: 'none', color: 'var(--accent-text)',
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
                  background: 'none', border: 'none', color: 'var(--text-secondary)',
                  fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Back to Sign In
              </button>
            </div>
          )}

          {mode === 'forgot' && forgotSent && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              {devLink ? (
                <>
                  <div style={{
                    marginBottom: 14, padding: '12px', borderRadius: 8,
                    backgroundColor: 'rgba(251,191,36,0.1)',
                    border: '1px solid rgba(251,191,36,0.2)',
                  }}>
                    <p style={{ fontSize: 13, color: '#fbbf24', margin: '0 0 10px' }}>
                      Email system is not configured on this server. Use the link below to reset your password:
                    </p>
                    <a href={devLink} style={{
                      display: 'inline-block', padding: '10px 20px',
                      background: '#2563eb', color: '#fff', borderRadius: 8,
                      textDecoration: 'none', fontSize: 14, fontWeight: 600,
                    }}>
                      Click to Reset Password
                    </a>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                    (Also printed in the server console)
                  </p>
                </>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Check your email for the reset link.
                </p>
              )}
              {cooldown > 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  You can request another link in {cooldown}s
                </p>
              )}
              <button
                onClick={() => switchMode('login')}
                style={{
                  background: 'none', border: 'none', color: 'var(--accent-text)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Back to Sign In
              </button>
            </div>
          )}

          {mode === 'reset' && resetDone && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                backgroundColor: 'rgba(52,211,153,0.1)', color: '#34d399',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px', fontSize: 28,
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Your password has been reset successfully.
              </p>
              <button
                onClick={() => switchMode('login')}
                style={{
                  background: '#2563eb', border: 'none', color: '#fff',
                  padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {redirectCountdown > 0 ? `Sign In (${redirectCountdown})` : 'Sign In'}
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
  backgroundColor: 'var(--track-bg)',
  border: '1px solid var(--border-strong)',
  borderRadius: 8, color: 'var(--text-primary)',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}
