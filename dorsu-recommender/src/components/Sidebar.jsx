export default function Sidebar({ user, activePage, onHome, onAssessment, onProfile, onFAQ, onAdmin, onLogout, open, onToggle }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'home', action: onHome },
    { id: 'assessment', label: 'Assessment', icon: 'clipboard', action: onAssessment },
    { id: 'profile', label: 'Profile', icon: 'user', action: onProfile },
    { id: 'faq', label: 'FAQ', icon: 'helpCircle', action: onFAQ },
  ]

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin', icon: 'shield', action: onAdmin })
  }

  const icons = {
    home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    clipboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
    user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    helpCircle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    logOut: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  }

  const barStyle = {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: open ? 'flex-start' : 'center',
    padding: '10px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
    background: 'transparent',
    fontFamily: 'inherit', textAlign: 'left',
    transition: 'all 0.15s',
    gap: 10,
  }

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: open ? 220 : 56,
      overflow: 'hidden',
      backgroundColor: '#0b1222',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      zIndex: 100,
      transition: 'width 0.3s ease',
    }}>
      {open ? (
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>DOrSU</div>
              <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.2 }}>Recommender</div>
            </div>
          </div>
          <button onClick={onToggle} style={{
            width: 28, height: 28, flexShrink: 0,
            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', padding: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ) : (
        <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'center' }}>
          <button onClick={onToggle} style={{
            width: 28, height: 28,
            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', padding: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      <div style={{ padding: '8px 0', flex: 1, display: 'flex', flexDirection: 'column', alignItems: open ? 'stretch' : 'center' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={item.action}
            style={{
              ...barStyle,
              padding: open ? '10px 12px' : '10px 0',
              width: open ? '100%' : 36,
              color: activePage === item.id ? '#60a5fa' : '#94a3b8',
              fontWeight: activePage === item.id ? 600 : 400,
              background: activePage === item.id ? 'rgba(59,130,246,0.15)' : 'transparent',
              borderRadius: open ? 8 : 6,
            }}
            onMouseEnter={e => { if (activePage !== item.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e2e8f0' } }}
            onMouseLeave={e => { if (activePage !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' } }}
          >
            <span style={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icons[item.icon]}</span>
            {open && item.label}
          </button>
        ))}
      </div>

      <div style={{
        padding: open ? '12px 8px' : '8px 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: open ? 'stretch' : 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: open ? '8px 12px' : '4px 0', justifyContent: open ? 'flex-start' : 'center' }}>
          {user?.avatar ? (
            <img src={user.avatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          )}
          {open && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.firstName || ''} {user?.lastName || ''}
              </div>
              {user?.role === 'admin' && (
                <span style={{ fontSize: 10, color: '#22d3ee', fontWeight: 600 }}>Admin</span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          style={{
            ...barStyle,
            padding: open ? '10px 12px' : '10px 0',
            width: open ? '100%' : 36,
            color: '#64748b',
            borderRadius: open ? 8 : 6,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
        >
          <span style={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icons.logOut}</span>
          {open && 'Sign Out'}
        </button>
      </div>
    </div>
  )
}
