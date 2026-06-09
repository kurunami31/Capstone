import { useState, useEffect } from 'react'
import SkeletonLoader, { SkeletonCard } from './SkeletonLoader.jsx'

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
      background: 'linear-gradient(135deg, #0f172a 0%, var(--table-header) 50%, #0f172a 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Notifications
          </h1>
          {notifications.some(n => !n.isRead) && (
            <button onClick={markAllRead} style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 600,
              backgroundColor: 'transparent', color: 'var(--accent-text)',
              border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, cursor: 'pointer',
            }}>
              Mark All Read
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonCard lines={1} />
            <SkeletonCard lines={2} />
            <SkeletonCard lines={1} />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--card-bg)', borderRadius: 16, padding: 40,
            border: '1px solid var(--track-bg)', textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No notifications yet.</p>
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
                  border: `1px solid ${n.isRead ? 'var(--card-bg)' : 'var(--accent-bg)'}`,
                  cursor: n.isRead ? 'default' : 'pointer',
                  transition: 'background-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{n.title}</div>
                    {n.body && <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.body}</div>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
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
