import { useState, useRef, useEffect } from 'react'

export default function CustomSelect({ value, onChange, options, placeholder, style, minWidth }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find(o => o.value === value)
  const label = selected ? selected.label : placeholder

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: minWidth || 160, ...style }} tabIndex={-1}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 10,
          border: '1px solid var(--input-border, rgba(255,255,255,0.1))',
          background: 'var(--input-bg, rgba(255,255,255,0.05))', color: 'var(--text-input)',
          fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
          background: 'var(--card-bg, #1e293b)',
          border: '1px solid var(--card-border, rgba(255,255,255,0.08))',
          borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}>
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              style={{
                width: '100%', padding: '10px 14px', border: 'none',
                background: value === o.value ? 'var(--accent-bg, rgba(59,130,246,0.1))' : 'transparent',
                color: 'var(--text-input)',
                fontSize: 13, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover-bg, rgba(255,255,255,0.05))' }}
              onMouseLeave={e => { e.currentTarget.style.background = value === o.value ? 'var(--accent-bg, rgba(59,130,246,0.1))' : 'transparent' }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
