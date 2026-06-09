import { useState, useRef, useEffect } from 'react'
import glossary from '../data/glossary.json'

export default function GlossaryTooltip({ term }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const entry = glossary.find(e => e.term.toLowerCase() === term.toLowerCase())

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!entry) return null

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Learn more about ${term}`}
        style={{
          width: 16, height: 16, borderRadius: '50%', border: '1px solid var(--text-muted)',
          background: 'transparent', color: 'var(--text-muted)', fontSize: 10, fontWeight: 700,
          cursor: 'pointer', padding: 0, lineHeight: '14px', textAlign: 'center', flexShrink: 0,
          marginLeft: 4, transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-bg)'; e.currentTarget.style.color = 'var(--accent-text)'; e.currentTarget.style.borderColor = 'var(--accent-text)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--text-muted)' }}
      >
        ?
      </button>
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, minWidth: 260, maxWidth: 320,
          background: 'var(--modal-bg)', border: '1px solid var(--card-border)',
          borderRadius: 12, padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{entry.term}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{entry.definition}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, borderTop: '1px solid var(--track-bg)', paddingTop: 6, marginTop: 4 }}>
            <strong>Tagalog:</strong> {entry.tagalog}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 4 }}>
            <strong>Cebuano:</strong> {entry.cebuano}
          </div>
        </div>
      )}
    </span>
  )
}
