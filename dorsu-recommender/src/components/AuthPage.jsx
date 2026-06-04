import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setError('')
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
        <div style={{
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
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 6 }}>
              {mode === 'login'
                ? 'Sign in to continue to the program recommender.'
                : 'Register to start your college program assessment.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: 18, animation: 'fadeInUp 0.3s ease-out both' }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  style={inputStyle}
                  autoFocus
                />
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
                autoFocus={mode === 'login'}
              />
            </div>

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
              disabled={submitting}
              style={{
                width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700,
                backgroundColor: '#2563eb', color: '#fff',
                border: 'none', borderRadius: 10, cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <button
              onClick={switchMode}
              style={{
                background: 'none', border: 'none', color: '#60a5fa',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', marginLeft: 4,
                textDecoration: 'underline',
              }}
            >
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </div>
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
