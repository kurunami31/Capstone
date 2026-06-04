import { useState, useEffect } from 'react'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function fetchStats() {
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      setStats(data)
    } catch (e) {
      setError(e.message)
    }
  }

  async function fetchUsers(p, q) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p || page, limit: '20' })
      if (q || search) params.set('search', q || search)
      const res = await fetch(`/api/admin/users?${params}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users)
      setTotal(data.total)
      setPage(data.page)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats(); fetchUsers(1, '') }, [])

  async function handleDelete(id) {
    if (!confirm('Delete this user? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }
      fetchUsers(page, '')
      fetchStats()
    } catch (e) {
      setError(e.message)
    }
  }

  function handleSearch(val) {
    setSearch(val)
    fetchUsers(1, val)
  }

  const containerStyle = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
  }

  const cardStyle = {
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16,
    backdropFilter: 'blur(8px)',
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '8px 12px',
    color: '#e2e8f0',
    fontSize: 13,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 60px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 24px' }}>Admin Panel</h1>

        {error && (
          <div style={{ ...cardStyle, padding: '12px 18px', marginBottom: 20, color: '#f87171', fontSize: 13 }}>
            {error}
            <button onClick={() => setError('')} style={{
              marginLeft: 12, background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 13,
            }}>Dismiss</button>
          </div>
        )}

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Total Users', value: stats.totalUsers, color: '#3b82f6' },
              { label: 'Assessments', value: stats.totalAssessments, color: '#8b5cf6' },
              { label: 'Admins', value: stats.adminCount, color: '#06b6d4' },
            ].map(s => (
              <div key={s.label} style={{ ...cardStyle, padding: '20px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ ...cardStyle, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Users</h2>
              <span style={{ fontSize: 12, color: '#64748b' }}>{total} total</span>
            </div>
            <input
              placeholder="Search users..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              style={{ ...inputStyle, maxWidth: 240 }}
            />
          </div>

          {loading ? (
            <div style={{ color: '#64748b', fontSize: 13, padding: 20, textAlign: 'center' }}>Loading users...</div>
          ) : users.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: 13, padding: 20, textAlign: 'center' }}>No users found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {u.avatar ? (
                          <img src={u.avatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                          </div>
                        )}
                        <span style={{ color: '#e2e8f0' }}>{u.firstName}{u.lastName ? ` ${u.lastName}` : ''}</span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{u.email}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 10,
                          fontSize: 11, fontWeight: 600,
                          backgroundColor: u.role === 'admin' ? 'rgba(6,182,212,0.15)' : 'rgba(59,130,246,0.15)',
                          color: u.role === 'admin' ? '#22d3ee' : '#60a5fa',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 12 }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <button onClick={() => handleDelete(u.id)} style={{
                          background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171',
                          fontSize: 11, padding: '3px 10px', borderRadius: 6, cursor: 'pointer',
                        }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {total > 20 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button
                disabled={page <= 1}
                onClick={() => fetchUsers(page - 1, '')}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: page <= 1 ? '#475569' : '#94a3b8', padding: '6px 14px', borderRadius: 6,
                  fontSize: 12, cursor: page <= 1 ? 'default' : 'pointer',
                }}
              >Previous</button>
              <span style={{ color: '#64748b', fontSize: 12, padding: '6px 0' }}>Page {page} of {Math.ceil(total / 20)}</span>
              <button
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => fetchUsers(page + 1, '')}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: page >= Math.ceil(total / 20) ? '#475569' : '#94a3b8', padding: '6px 14px', borderRadius: 6,
                  fontSize: 12, cursor: page >= Math.ceil(total / 20) ? 'default' : 'pointer',
                }}
              >Next</button>
            </div>
          )}
        </div>

        {stats && stats.recentUsers && (
          <div style={{ ...cardStyle, padding: 20, marginTop: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: '0 0 12px' }}>Recent Registrations</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.recentUsers.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                  {u.avatar ? (
                    <img src={u.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  )}
                  <span style={{ color: '#e2e8f0', fontSize: 13 }}>{u.firstName} {u.lastName}</span>
                  <span style={{ color: '#64748b', fontSize: 12 }}>{u.email}</span>
                  <span style={{ marginLeft: 'auto', color: '#475569', fontSize: 11 }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
