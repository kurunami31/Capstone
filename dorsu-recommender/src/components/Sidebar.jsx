function HamburgerIcon({ open }) {
  const bar = {
    position: 'absolute', left: 2, right: 2, height: 2,
    borderRadius: 1, backgroundColor: 'currentColor',
    transition: 'all 0.3s ease',
  }

  return (
    <div style={{ position: 'relative', width: 16, height: 16, flexShrink: 0 }}>
      <span style={{ ...bar, top: open ? 7 : 3, transform: open ? 'rotate(45deg)' : 'rotate(0)' }} />
      <span style={{ ...bar, top: 7, opacity: open ? 0 : 1 }} />
      <span style={{ ...bar, top: open ? 7 : 11, transform: open ? 'rotate(-45deg)' : 'rotate(0)' }} />
    </div>
  )
}

export default function Sidebar({ user, activePage, onHome, onAssessment, onProfile, onHistory, onFAQ, onAdmin, onLogout, open, onToggle, isMobile }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'home', action: onHome },
  ]

  if (user?.role !== 'admin') {
    navItems.push({ id: 'profile', label: 'Profile', icon: 'user', action: onProfile })
    navItems.push({ id: 'history', label: 'History', icon: 'clock', action: onHistory })
  }

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin', icon: 'shield', action: onAdmin })
  } else {
    navItems.push({ id: 'faq', label: 'FAQ', icon: 'helpCircle', action: onFAQ })
  }

  const icons = {
    home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    clipboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
    user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    helpCircle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    logOut: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  }

  const barStyle = {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : (open ? 'flex-start' : 'center'),
    padding: isMobile ? '12px 10px' : '10px 0',
    border: 'none', borderRadius: 8, cursor: 'pointer',
    background: 'transparent',
    fontFamily: 'inherit', textAlign: 'left',
    transition: 'all 0.15s',
    gap: 10,
  }

  const sidebarWidth = isMobile ? 240 : (open ? 220 : 92)

  return (
    <>
      {isMobile && open && (
        <div
          onClick={onToggle}
          style={{
            position: 'fixed', inset: 0, zIndex: 99,
            background: 'rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.2s ease-out both',
          }}
        />
      )}
      {isMobile && !open && (
        <button onClick={onToggle} style={{
          position: 'fixed', left: 10, top: 10, zIndex: 100,
          width: 40, height: 40,
          background: '#0b1222', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94a3b8', padding: 0,
        }}>
          <HamburgerIcon open={false} />
        </button>
      )}
      <div style={{
        position: isMobile ? 'fixed' : 'fixed', left: isMobile ? (open ? 0 : -sidebarWidth) : 0, top: 0, bottom: 0,
        width: sidebarWidth,
        overflow: 'hidden',
        backgroundColor: '#0b1222',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        zIndex: 100,
        transition: 'left 0.3s ease, width 0.3s ease',
      }}>
          <div style={{ padding: isMobile ? '16px 12px 12px' : (open ? '20px 16px 16px' : '10px 10px'), borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/>
              </svg>
            </div>
            <div style={{ opacity: isMobile || open ? 1 : 0, transition: 'opacity 0.15s', overflow: 'hidden', whiteSpace: 'nowrap', width: isMobile || open ? 'auto' : 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2, whiteSpace: 'nowrap' }}>DOrSU</div>
              <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.2, whiteSpace: 'nowrap' }}>Recommender</div>
            </div>
            <button onClick={onToggle} style={{
              width: 28, height: 28, flexShrink: 0, marginLeft: 'auto',
              background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8', padding: 0,
            }}>
              <HamburgerIcon open={isMobile || open} />
            </button>
          </div>

        <div style={{ padding: '8px 0', flex: 1, display: 'flex', flexDirection: 'column', alignItems: isMobile || open ? 'stretch' : 'center' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { item.action(); if (isMobile) onToggle() }}
              style={{
                ...barStyle,
                padding: isMobile ? '12px 12px' : (open ? '10px 12px' : '10px 0'),
                width: isMobile ? '100%' : (open ? '100%' : 36),
                color: activePage === item.id ? '#60a5fa' : '#94a3b8',
                fontWeight: activePage === item.id ? 600 : 400,
                background: activePage === item.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                borderRadius: isMobile ? 8 : (open ? 8 : 6),
              }}
              onMouseEnter={e => { if (activePage !== item.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e2e8f0' } }}
              onMouseLeave={e => { if (activePage !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' } }}
            >
              <span style={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icons[item.icon]}</span>
              {(isMobile || open) && item.label}
            </button>
          ))}
        </div>

        <div style={{
          padding: isMobile ? '12px 8px' : (open ? '12px 8px' : '8px 0'),
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', alignItems: isMobile || open ? 'stretch' : 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: isMobile ? '8px 12px' : (open ? '8px 12px' : '4px 0'), justifyContent: isMobile || open ? 'flex-start' : 'center' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            )}
            {(isMobile || open) && (
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
            onClick={() => { onLogout(); if (isMobile) onToggle() }}
            style={{
              ...barStyle,
              padding: isMobile ? '12px 12px' : (open ? '10px 12px' : '10px 0'),
              width: isMobile ? '100%' : (open ? '100%' : 36),
              color: '#64748b',
              borderRadius: isMobile ? 8 : (open ? 8 : 6),
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
          >
            <span style={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icons.logOut}</span>
            {(isMobile || open) && 'Sign Out'}
          </button>
        </div>
      </div>
    </>
  )
}
