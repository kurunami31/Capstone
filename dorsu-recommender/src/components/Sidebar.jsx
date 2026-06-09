import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { useTranslation } from '../hooks/useTranslation.js'

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

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

export default function Sidebar({ user, activePage, onHome, onAssessment, onProfile, onHistory, onPrograms, onSettings, onQuestions, onReview, onFAQ, onAdmin, onNotifications, onCareerExplorer, onDevelopers, onLogout, open, onToggle, isMobile }) {
  const staffRoles = ['admin', 'super_admin', 'department_head', 'counselor']
  const isStaff = staffRoles.includes(user?.role)
  const [unreadCount, setUnreadCount] = useState(0)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light')
  const { locale, changeLocale } = useLanguage()
  const { t } = useTranslation()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const fetchCount = () => {
      fetch('/api/notifications/unread-count', { credentials: 'include' })
        .then(r => r.json())
        .then(d => setUnreadCount(d.count || 0))
        .catch(() => {})
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { id: 'home', label: t('nav.dashboard'), icon: 'home', action: onHome },
  ]

  if (!isStaff) {
    navItems.push({ id: 'profile', label: t('nav.profile'), icon: 'user', action: onProfile })
    navItems.push({ id: 'history', label: t('nav.history'), icon: 'clock', action: onHistory })
    navItems.push({ id: 'programs', label: t('nav.programs'), icon: 'book', action: onPrograms })
    navItems.push({ id: 'careers', label: t('nav.careerExplorer'), icon: 'briefcase', action: onCareerExplorer })
  }

  if (isStaff) {
    navItems.push({ id: 'programs', label: t('nav.programs'), icon: 'book', action: onPrograms })
    navItems.push({ id: 'settings', label: t('nav.settings'), icon: 'sliders', action: onSettings })
    navItems.push({ id: 'questions', label: t('nav.faq'), icon: 'helpCircle', action: onQuestions })
    navItems.push({ id: 'review', label: t('nav.activity'), icon: 'checkCircle', action: onReview })
    navItems.push({ id: 'admin', label: t('nav.admin'), icon: 'shield', action: onAdmin })
  } else {
    navItems.push({ id: 'faq', label: t('nav.faq'), icon: 'helpCircle', action: onFAQ })
  }

  navItems.push({ id: 'notifications', label: t('nav.notifications'), icon: 'bell', action: onNotifications })
  navItems.push({ id: 'developers', label: 'About', icon: 'users', action: onDevelopers })

  const icons = {
    home: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    clipboard: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
    user: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    book: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
    sliders: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="2" y1="14" x2="6" y2="14"/><line x1="10" y1="12" x2="14" y2="12"/><line x1="18" y1="16" x2="22" y2="16"/></svg>,
    helpCircle: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    checkCircle: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    clock: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    shield: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    logOut: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    bell: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    briefcase: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    users: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  }

  const barStyle = {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'flex-start' : (open ? 'flex-start' : 'center'),
    padding: isMobile ? '12px 10px' : '12px 0',
    border: 'none', borderRadius: 8, cursor: 'pointer',
    background: 'transparent',
    fontFamily: 'inherit', textAlign: 'left',
    transition: 'all 0.15s',
    gap: 14,
    fontSize: 15,
  }

  const sidebarWidth = isMobile ? 240 : (open ? 250 : 104)

  return (
    <>
      {isMobile && open && (
        <div
          onClick={onToggle}
          style={{
            position: 'fixed', inset: 0, zIndex: 99,
            background: 'var(--overlay-bg, rgba(0,0,0,0.5))',
            animation: 'fadeIn 0.2s ease-out both',
          }}
        />
      )}
      {isMobile && !open && (
        <button onClick={onToggle} style={{
          position: 'fixed', left: 10, top: 10, zIndex: 100,
          width: 40, height: 40,
          background: 'var(--sidebar-bg)', border: '1px solid var(--border-strong)',
          borderRadius: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)', padding: 0,
        }}>
          <HamburgerIcon open={false} />
        </button>
      )}
      <div style={{
        position: isMobile ? 'fixed' : 'fixed', left: isMobile ? (open ? 0 : -sidebarWidth) : 0, top: 0, bottom: 0,
        width: sidebarWidth,
        overflow: 'hidden',
        backgroundColor: 'var(--sidebar-bg, #0b1222)',
        borderRight: '1px solid var(--sidebar-border, rgba(255,255,255,0.05))',
        display: 'flex', flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        zIndex: 100,
        transition: 'left 0.3s ease, width 0.3s ease',
      }}>
          <div style={{ padding: isMobile ? '16px 12px 12px' : (open ? '20px 16px 16px' : '12px 10px'), borderBottom: '1px solid var(--input-bg)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.png" alt="DOrSU" style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0, objectFit: 'cover',
            }} />
            <div style={{ opacity: isMobile || open ? 1 : 0, transition: 'opacity 0.15s', overflow: 'hidden', whiteSpace: 'nowrap', width: isMobile || open ? 'auto' : 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>DOrSU</div>
              <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.2, whiteSpace: 'nowrap' }}>Recommender</div>
            </div>
            <button onClick={onToggle} aria-label={open ? t('common.dismiss') : t('nav.dashboard')} style={{
              width: 28, height: 28, flexShrink: 0, marginLeft: 'auto',
              background: 'var(--track-bg)', border: 'none', borderRadius: 6,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', padding: 0,
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
                padding: isMobile ? '16px 16px' : (open ? '14px 16px' : '16px 0'),
                width: isMobile ? '100%' : (open ? '100%' : 44),
                color: activePage === item.id ? 'var(--accent-text)' : 'var(--text-muted, #94a3b8)',
                fontWeight: activePage === item.id ? 600 : 400,
                background: activePage === item.id ? 'var(--accent-bg)' : 'transparent',
                borderRadius: isMobile ? 8 : (open ? 8 : 6),
                position: 'relative',
              }}
              onMouseEnter={e => { if (activePage !== item.id) { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.color = 'var(--text-input)' } }}
              onMouseLeave={e => { if (activePage !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
            >
              <span style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon === 'bell' && unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 6, right: isMobile || open ? 14 : 0,
                    minWidth: 16, height: 16, borderRadius: 8,
                    backgroundColor: '#ef4444', color: '#fff',
                    fontSize: 9, fontWeight: 700, lineHeight: '16px',
                    textAlign: 'center', padding: '0 4px',
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {icons[item.icon]}
              </span>
              {(isMobile || open) && item.label}
            </button>
          ))}
        </div>

        <div style={{
          padding: isMobile ? '12px 8px' : (open ? '12px 8px' : '8px 0'),
          borderTop: '1px solid var(--input-bg)',
          display: 'flex', flexDirection: 'column', alignItems: isMobile || open ? 'stretch' : 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: isMobile ? '8px 12px' : (open ? '8px 12px' : '4px 0'), justifyContent: isMobile || open ? 'flex-start' : 'center' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1e40af, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            )}
            {(isMobile || open) && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #e2e8f0)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.firstName || ''} {user?.lastName || ''}
                </div>
                {user?.role && user?.role !== 'user' && (
                  <span style={{ fontSize: 12, color: '#22d3ee', fontWeight: 600 }}>
                    {{
                      super_admin: 'Super Admin',
                      admin: 'Admin',
                      department_head: 'Dept Head',
                      counselor: 'Counselor',
                    }[user.role] || user.role}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setDark(!dark)}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              ...barStyle,
              padding: isMobile ? '14px 14px' : (open ? '12px 16px' : '14px 0'),
              width: isMobile ? '100%' : (open ? '100%' : 44),
              color: 'var(--text-muted)',
              borderRadius: isMobile ? 8 : (open ? 8 : 6),
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-input)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <span style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {dark ? <SunIcon /> : <MoonIcon />}
            </span>
            {(isMobile || open) && (dark ? t('theme.light') : t('theme.dark'))}
          </button>
          {(isMobile || open) && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: isMobile ? '8px 14px' : '6px 16px',
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4, whiteSpace: 'nowrap' }}>Lang:</span>
              {['en', 'tl', 'ceb'].map(l => (
                <button
                  key={l}
                  onClick={() => changeLocale(l)}
                  style={{
                    padding: '2px 8px', borderRadius: 4, border: 'none',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: locale === l ? 'var(--accent-bg, #1e40af)' : 'transparent',
                    color: locale === l ? 'var(--accent-text, #60a5fa)' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => { onLogout(); if (isMobile) onToggle() }}
            aria-label="Log out"
            style={{
              ...barStyle,
              padding: isMobile ? '14px 14px' : (open ? '12px 16px' : '14px 0'),
              width: isMobile ? '100%' : (open ? '100%' : 44),
              color: 'var(--text-muted)',
              borderRadius: isMobile ? 8 : (open ? 8 : 6),
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.color = 'var(--danger)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <span style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icons.logOut}</span>
            {(isMobile || open) && t('nav.logout')}
          </button>
        </div>
      </div>
    </>
  )
}
