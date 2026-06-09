import { Component } from 'react'
import { useTranslation } from '../hooks/useTranslation.js'

function ErrorFallback({ error, onRetry }) {
  const { t } = useTranslation()
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--gradient-start, #0f172a) 0%, var(--gradient-mid, #1e3a5f) 50%, var(--gradient-end, #0f172a) 100%)',
      color: '#94a3b8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: 24,
    }}>
      <div style={{ maxWidth: 400, textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', margin: '0 0 8px' }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.5, margin: '0 0 20px' }}>
          {error?.message || t('common.noData')}
        </p>
        <button onClick={onRetry} style={{
          padding: '10px 24px', borderRadius: 10, border: 'none',
          backgroundColor: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          Try Again
        </button>
      </div>
    </div>
  )
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />
    }
    return this.props.children
  }
}
