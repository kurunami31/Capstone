import { useState, useEffect } from 'react'

export default function NotificationsPage({ onBack }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications?limit=50', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setNotifications(d.notifications || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PUT', credentials: 'include' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'PUT', credentials: 'include' })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
            Notifications
          </h1>
          {notifications.some(n => !n.isRead) && (
            <button onClick={markAllRead} style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 600,
              backgroundColor: 'transparent', color: '#60a5fa',
              border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, cursor: 'pointer',
            }}>
              Mark All Read
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b', fontSize: 14 }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 40,
            border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
          }}>
            <p style={{ color: '#64748b', fontSize: 14 }}>No notifications yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead(n.id)}
                style={{
                  backgroundColor: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(59,130,246,0.06)',
                  borderRadius: 12, padding: '14px 18px',
                  border: `1px solid ${n.isRead ? 'rgba(255,255,255,0.04)' : 'rgba(59,130,246,0.15)'}`,
                  cursor: n.isRead ? 'default' : 'pointer',
                  transition: 'background-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>{n.title}</div>
                    {n.body && <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.4 }}>{n.body}</div>}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
