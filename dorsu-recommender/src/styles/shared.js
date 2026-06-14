export const primaryBtn = {
  padding: '12px 40px', fontSize: 15, fontWeight: 600,
  backgroundColor: '#2563eb', color: '#fff',
  border: 'none', borderRadius: 10, cursor: 'pointer',
  transition: 'all 0.2s',
}

export const secondaryBtn = {
  padding: '12px 40px', fontSize: 15, fontWeight: 600,
  backgroundColor: 'var(--card-bg)', color: 'var(--text-secondary)',
  border: '1px solid var(--border-strong)', borderRadius: 10, cursor: 'pointer',
  transition: 'all 0.2s',
}

export function btnStyle(ready) {
  return {
    padding: '12px 40px', fontSize: 15, fontWeight: 600,
    backgroundColor: ready ? '#2563eb' : 'var(--border-strong)', color: '#fff',
    border: 'none', borderRadius: 10, cursor: ready ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s',
  }
}
