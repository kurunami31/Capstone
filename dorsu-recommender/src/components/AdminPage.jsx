import { useState, useEffect } from 'react'
import SkeletonLoader from './SkeletonLoader.jsx'

const CARD = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 16,
  backdropFilter: 'blur(8px)',
}

const INPUT = {
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

const BTN_SECONDARY = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#94a3b8',
  padding: '8px 16px',
  borderRadius: 8,
  fontSize: 13,
  cursor: 'pointer',
}

const COLORS = ['#3b82f6', '#06b6d4', '#22c55e', '#eab308', '#f97316', '#ef4444', '#a855f7', '#ec4899', '#14b8a6', '#6366f1']

function BarChart({ data, labelKey, valueKey, color, maxLabel }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {data.map((d, i) => (
        <div key={d[labelKey]}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
            <span style={{ color: '#94a3b8' }}>{d[labelKey]}</span>
            <span style={{ color: '#64748b' }}>{d[valueKey]}{maxLabel ? ` ${maxLabel}` : ''}</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              width: `${(d[valueKey] / max) * 100}%`, height: '100%',
              background: Array.isArray(color) ? color[i % color.length] : color,
              borderRadius: 4, transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function VerticalBarChart({ data, labelKey, valueKey, color }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, paddingTop: 20 }}>
      {data.map(d => (
        <div key={d[labelKey]} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
          <div style={{
            width: '100%', maxWidth: 40,
            height: `${(d[valueKey] / max) * 100}%`,
            background: color || '#3b82f6',
            borderRadius: '4px 4px 0 0',
            transition: 'height 0.6s ease',
            minHeight: 4,
          }} />
          <div style={{ fontSize: 9, color: '#64748b', marginTop: 4, textAlign: 'center', writingMode: 'vertical-lr', transform: 'rotate(180deg)', height: 40, lineHeight: '10px' }}>
            {d[labelKey]}
          </div>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{d[valueKey]}</div>
        </div>
      ))}
    </div>
  )
}

function PieChart({ data, labelKey, valueKey, colors }) {
  const total = data.reduce((a, d) => a + d[valueKey], 0) || 1
  let cumulative = 0
  const segments = data.map((d, i) => {
    const pct = d[valueKey] / total
    const start = cumulative
    cumulative += pct * 360
    return { ...d, start, end: cumulative, color: colors[i % colors.length], pct: Math.round(pct * 100) }
  })

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {segments.map((s, i) => {
          const r = 50
          const cx = 60, cy = 60
          const a1 = (s.start - 90) * Math.PI / 180
          const a2 = (s.end - 90) * Math.PI / 180
          const x1 = cx + r * Math.cos(a1)
          const y1 = cy + r * Math.sin(a1)
          const x2 = cx + r * Math.cos(a2)
          const y2 = cy + r * Math.sin(a2)
          const large = s.end - s.start > 180 ? 1 : 0
          if (s.pct === 0) return null
          if (segments.length === 1) {
            return <circle key={i} cx={cx} cy={cy} r={r} fill={s.color} />
          }
          return (
            <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={s.color} stroke="#0f172a" strokeWidth="1" />
          )
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
            <span style={{ color: '#94a3b8' }}>{s[labelKey]}</span>
            <span style={{ color: '#64748b' }}>{s[valueKey]} ({s.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminPage({ userRole = 'admin' }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState({ userGrowth: [], programPopularity: [], hollandDistribution: [], strandDistribution: [] })
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedRow, setExpandedRow] = useState(null)
  const [activityLog, setActivityLog] = useState([])
  const [editUserModal, setEditUserModal] = useState(null)
  const [editUserData, setEditUserData] = useState({})
  const [editUserError, setEditUserError] = useState('')
  const [activityPage, setActivityPage] = useState(1)
  const [activityTotal, setActivityTotal] = useState(0)
  const [debugInfo, setDebugInfo] = useState(null)

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
      if (data._debug) {
        setDebugInfo(data._debug);
        console.log('Admin users debug:', data._debug);
        console.log('TOTAL from server:', data.total);
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchAnalytics() {
    const endpoints = [
      { key: 'userGrowth', url: '/api/admin/analytics/user-growth' },
      { key: 'programPopularity', url: '/api/admin/analytics/program-popularity' },
      { key: 'hollandDistribution', url: '/api/admin/analytics/holland-distribution' },
      { key: 'strandDistribution', url: '/api/admin/analytics/strand-distribution' },
    ]
    const results = {}
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep.url, { credentials: 'include' })
        if (res.ok) results[ep.key] = await res.json()
      } catch {}
    }
    setAnalytics(prev => ({ ...prev, ...results }))
  }

  async function fetchActivityLog(p) {
    try {
      const page = p !== undefined ? p : activityPage
      const res = await fetch(`/api/admin/activity?page=${page}&limit=100`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setActivityLog(data.entries || [])
        setActivityTotal(data.total || 0)
        if (p !== undefined) setActivityPage(p)
      }
    } catch {}
  }

  useEffect(() => {
    fetchStats()
    fetchUsers(1, '')
    fetchAnalytics()
    fetchActivityLog()
  }, [])

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

  function toggleRow(id) {
    setExpandedRow(prev => prev === id ? null : id)
  }

  function handleExport() {
    window.open('/api/admin/users/export', '_blank')
  }

  const totalAssessments = analytics.programPopularity.reduce((a, p) => a + p.count, 0)
  const isManager = ['admin', 'super_admin'].includes(userRole)
  const visibleUsers = userRole === 'admin'
    ? users.filter(u => u.role !== 'admin' && u.role !== 'super_admin')
    : users
  const tabs = isManager ? ['dashboard', 'users', 'activity'] : ['dashboard']

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Admin Panel</h1>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3, flexWrap: 'wrap' }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                background: activeTab === tab ? 'rgba(59,130,246,0.25)' : 'transparent',
                color: activeTab === tab ? '#60a5fa' : '#64748b',
                transition: 'all 0.2s',
              }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ ...CARD, padding: '12px 18px', marginBottom: 20, color: '#f87171', fontSize: 13 }}>
            {error}
            <button onClick={() => setError('')} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 13 }}>Dismiss</button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
              {[
                { label: 'Total Users', value: stats?.totalUsers ?? '-', color: '#3b82f6' },
                { label: 'Assessments', value: totalAssessments || '-', color: '#22c55e' },
                { label: 'Admins', value: stats?.adminCount ?? '-', color: '#06b6d4' },
              ].map(s => (
                <div key={s.label} style={{ ...CARD, padding: '18px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="r-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ ...CARD, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: '0 0 12px' }}>User Growth (Monthly)</h3>
                {analytics.userGrowth.length > 0 ? (
                  <VerticalBarChart
                    data={analytics.userGrowth.map(d => ({ ...d, month: new Date(d.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) }))}
                    labelKey="month" valueKey="count" color="#3b82f6"
                  />
                ) : (
                  <div style={{ color: '#475569', fontSize: 12, padding: '20px 0', textAlign: 'center' }}>No data yet</div>
                )}
              </div>
              <div style={{ ...CARD, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: '0 0 12px' }}>Program Popularity</h3>
                {analytics.programPopularity.length > 0 ? (
                  <BarChart data={analytics.programPopularity} labelKey="program" valueKey="count" color={COLORS} />
                ) : (
                  <div style={{ color: '#475569', fontSize: 12, padding: '20px 0', textAlign: 'center' }}>No data yet</div>
                )}
              </div>
            </div>

            <div className="r-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ ...CARD, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: '0 0 12px' }}>Holland Code Distribution</h3>
                {analytics.hollandDistribution.length > 0 && analytics.hollandDistribution.some(d => d.count > 0) ? (
                  <PieChart data={analytics.hollandDistribution} labelKey="code" valueKey="count" colors={['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#a855f7']} />
                ) : (
                  <div style={{ color: '#475569', fontSize: 12, padding: '20px 0', textAlign: 'center' }}>No data yet</div>
                )}
              </div>
              <div style={{ ...CARD, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: '0 0 12px' }}>Strand Distribution</h3>
                {analytics.strandDistribution.length > 0 ? (
                  <BarChart data={analytics.strandDistribution} labelKey="strand" valueKey="count" color={COLORS} />
                ) : (
                  <div style={{ color: '#475569', fontSize: 12, padding: '20px 0', textAlign: 'center' }}>No data yet</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div style={{ ...CARD, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Users</h2>
                <span style={{ fontSize: 12, color: '#64748b' }}>{total} total</span>
                {debugInfo && (
                  <span style={{ fontSize: 10, color: '#475569', marginLeft: 8 }}>
                    role:{debugInfo.userRole} countResult:{debugInfo.countResult} emails:{JSON.stringify(debugInfo.dataEmails)} countQ:{debugInfo.countQuery?.slice(0,200)} p:{JSON.stringify(debugInfo.countParams)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  placeholder="Search users..."
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  style={{ ...INPUT, maxWidth: 200 }}
                />
                <button onClick={handleExport} style={{
                  ...BTN_SECONDARY,
                  display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: 20 }}><SkeletonLoader height={14} width="40%" style={{ margin: '0 auto' }} /></div>
            ) : visibleUsers.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: 13, padding: 20, textAlign: 'center' }}>No users found.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['', 'User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h === '' ? null : h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleUsers.map(u => (
                      <>
                        <tr
                          key={u.id}
                          onClick={() => toggleRow(u.id)}
                          style={{
                            borderBottom: expandedRow === u.id ? 'none' : '1px solid rgba(255,255,255,0.04)',
                            cursor: 'pointer', transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '10px 12px', width: 20 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              style={{ transform: expandedRow === u.id ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{u.email}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              display: 'inline-block', padding: '2px 8px', borderRadius: 10,
                              fontSize: 11, fontWeight: 600,
                              backgroundColor: u.role === 'admin' || u.role === 'super_admin' ? 'rgba(6,182,212,0.15)' : 'rgba(59,130,246,0.15)',
                              color: u.role === 'admin' || u.role === 'super_admin' ? '#22d3ee' : '#60a5fa',
                            }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748b', fontSize: 12 }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                          </td>
                          <td style={{ padding: '10px 12px' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleDelete(u.id)} style={{
                              background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171',
                              fontSize: 11, padding: '3px 10px', borderRadius: 6, cursor: 'pointer',
                            }}>
                              Delete
                            </button>
                          </td>
                        </tr>
                        {expandedRow === u.id && (
                          <tr key={`${u.id}-expanded`}>
                            <td colSpan={6} style={{ padding: 0, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <div className="r-grid-2" style={{
                                padding: '16px 24px 16px 48px',
                                background: 'rgba(255,255,255,0.02)',
                                fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
                              }}>
                                <div>
                                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>First Name</span>
                                  <span style={{ color: '#e2e8f0' }}>{u.firstName || '-'}</span>
                                </div>
                                <div>
                                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Last Name</span>
                                  <span style={{ color: '#e2e8f0' }}>{u.lastName || '-'}</span>
                                </div>
                                <div>
                                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Middle Initial</span>
                                  <span style={{ color: '#e2e8f0' }}>{u.middleInitial || '-'}</span>
                                </div>
                                <div>
                                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Extension</span>
                                  <span style={{ color: '#e2e8f0' }}>{u.extensionName || '-'}</span>
                                </div>
                                <div>
                                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Role</span>
                                  <span style={{ color: '#e2e8f0' }}>{u.role}</span>
                                </div>
                                <div>
                                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Created</span>
                                  <span style={{ color: '#e2e8f0' }}>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</span>
                                </div>
                                <div>
                                  <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Updated</span>
                                  <span style={{ color: '#e2e8f0' }}>{u.updatedAt ? new Date(u.updatedAt).toLocaleString() : '-'}</span>
                                </div>
                              </div>
                              <div style={{ marginTop: 12, display: 'flex', gap: 8, padding: '0 24px 16px 48px' }}>
                                <button onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/admin/users/${u.id}/reset-cooldown`, { method: 'POST', credentials: 'include' })
                                    if (res.ok) fetchActivityLog()
                                  } catch {}
                                }} style={{
                                  padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(234,179,8,0.3)',
                                  background: 'rgba(234,179,8,0.1)', color: '#fbbf24', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                }}>
                                  Reset Cooldown
                                </button>
                                <button onClick={() => {
                                  setEditUserData({
                                    id: u.id, firstName: u.firstName || '', lastName: u.lastName || '',
                                    email: u.email, role: u.role,
                                  })
                                  setEditUserModal(true)
                                }} style={{
                                  padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.3)',
                                  background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                }}>
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
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
                    ...BTN_SECONDARY, padding: '6px 14px', fontSize: 12,
                    opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'default' : 'pointer',
                  }}
                >Previous</button>
                <span style={{ color: '#64748b', fontSize: 12, padding: '6px 0' }}>Page {page} of {Math.ceil(total / 20)}</span>
                <button
                  disabled={page >= Math.ceil(total / 20)}
                  onClick={() => fetchUsers(page + 1, '')}
                  style={{
                    ...BTN_SECONDARY, padding: '6px 14px', fontSize: 12,
                    opacity: page >= Math.ceil(total / 20) ? 0.4 : 1, cursor: page >= Math.ceil(total / 20) ? 'default' : 'pointer',
                  }}
                >Next</button>
              </div>
            )}
          </div>
        )}

        {editUserModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}>
            <div style={{
              background: '#1e293b', borderRadius: 16, padding: 28, maxWidth: 400, width: '100%',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}>
              <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Edit User</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input value={editUserData.firstName} onChange={e => setEditUserData(p => ({ ...p, firstName: e.target.value }))}
                  placeholder="First Name" style={INPUT} />
                <input value={editUserData.lastName} onChange={e => setEditUserData(p => ({ ...p, lastName: e.target.value }))}
                  placeholder="Last Name" style={INPUT} />
                <input value={editUserData.email} onChange={e => setEditUserData(p => ({ ...p, email: e.target.value }))}
                  placeholder="Email" style={INPUT} />
                <select value={editUserData.role} onChange={e => setEditUserData(p => ({ ...p, role: e.target.value }))}
                  style={{ ...INPUT, cursor: 'pointer' }}>
                  <option value="user">User</option>
                  <option value="counselor">Counselor</option>
                  <option value="department_head">Department Head</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {editUserError && (
                <div style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{editUserError}</div>
              )}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button onClick={() => { setEditUserModal(false); setEditUserError('') }} style={{
                  ...BTN_SECONDARY, padding: '8px 16px', fontSize: 13,
                }}>Cancel</button>
                <button onClick={async () => {
                  try {
                    const res = await fetch(`/api/admin/users/${editUserData.id}`, {
                      method: 'PUT', credentials: 'include',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        firstName: editUserData.firstName,
                        lastName: editUserData.lastName,
                        email: editUserData.email,
                        role: editUserData.role,
                      }),
                    })
                    if (!res.ok) {
                      const data = await res.json()
                      throw new Error(data.error || 'Save failed')
                    }
                    setEditUserModal(false)
                    setEditUserError('')
                    fetchUsers(page, '')
                    fetchActivityLog()
                  } catch (e) {
                    setEditUserError(e.message)
                  }
                }} style={{
                  background: '#2563eb', border: 'none', color: '#fff',
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>Save</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div style={{ ...CARD, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Activity Log</h2>
              <button onClick={() => fetchActivityLog(1)} style={{ ...BTN_SECONDARY, fontSize: 12, padding: '5px 12px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'middle' }}>
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Refresh
              </button>
            </div>
            {activityLog.length === 0 ? (
              <div style={{ color: '#475569', fontSize: 13, padding: 20, textAlign: 'center' }}>No activity recorded yet.</div>
            ) : (
              <>
                <div style={{ overflowX: 'auto', maxHeight: 500, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead style={{ position: 'sticky', top: 0 }}>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#1e3a5f' }}>
                        <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>User</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Action</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Details</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>IP</th>
                        <th style={{ textAlign: 'right', padding: '8px 12px', color: '#64748b', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLog.map(entry => (
                        <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>
                            {entry.first_name ? `${entry.first_name} ${entry.last_name || ''}`.trim() : entry.email || 'System'}
                          </td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{
                              display: 'inline-block', padding: '2px 7px', borderRadius: 8,
                              fontSize: 10, fontWeight: 600,
                              background: entry.action_type === 'login' ? 'rgba(34,197,94,0.15)' :
                                entry.action_type === 'register' ? 'rgba(59,130,246,0.15)' :
                                entry.action_type === 'assessment_save' ? 'rgba(168,85,247,0.15)' :
                                entry.action_type === 'settings_update' || entry.action_type === 'program_toggle' ? 'rgba(6,182,212,0.15)' :
                                'rgba(255,255,255,0.06)',
                              color: entry.action_type === 'login' ? '#4ade80' :
                                entry.action_type === 'register' ? '#60a5fa' :
                                entry.action_type === 'assessment_save' ? '#c084fc' :
                                entry.action_type === 'settings_update' || entry.action_type === 'program_toggle' ? '#22d3ee' :
                                '#94a3b8',
                            }}>
                              {entry.action_type.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', color: '#94a3b8', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.details || '-'}
                          </td>
                          <td style={{ padding: '8px 12px', color: '#64748b', fontSize: 11 }}>{entry.ip_address || '-'}</td>
                          <td style={{ padding: '8px 12px', color: '#64748b', fontSize: 11, textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {entry.created_at ? new Date(entry.created_at).toLocaleString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {activityTotal > 100 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                    <button disabled={activityPage <= 1} onClick={() => fetchActivityLog(activityPage - 1)} style={{
                      ...BTN_SECONDARY, padding: '5px 12px', fontSize: 11,
                      opacity: activityPage <= 1 ? 0.4 : 1, cursor: activityPage <= 1 ? 'default' : 'pointer',
                    }}>Previous</button>
                    <span style={{ color: '#64748b', fontSize: 11, padding: '6px 0' }}>Page {activityPage} of {Math.ceil(activityTotal / 100)}</span>
                    <button disabled={activityPage >= Math.ceil(activityTotal / 100)} onClick={() => fetchActivityLog(activityPage + 1)} style={{
                      ...BTN_SECONDARY, padding: '5px 12px', fontSize: 11,
                      opacity: activityPage >= Math.ceil(activityTotal / 100) ? 0.4 : 1, cursor: activityPage >= Math.ceil(activityTotal / 100) ? 'default' : 'pointer',
                    }}>Next</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
