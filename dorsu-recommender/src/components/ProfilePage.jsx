import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('account')
  const [firstName, setFirstName] = useState(user?.firstName || user?.first_name || '')
  const [lastName, setLastName] = useState(user?.lastName || user?.last_name || '')
  const [middleInitial, setMiddleInitial] = useState(user?.middleInitial || user?.middle_initial || '')
  const [extensionName, setExtensionName] = useState(user?.extensionName || user?.extension_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')
  const [avatarUpdating, setAvatarUpdating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [changingPwd, setChangingPwd] = useState(false)
  const [hasPassword, setHasPassword] = useState(null)
  const [oauthProviders, setOauthProviders] = useState([])
  const fileRef = useRef(null)

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500000) { setProfileErr('Image must be under 500KB'); return }
    setAvatarUpdating(true)
    setProfileErr('')
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const dataUrl = reader.result
        const res = await fetch('/api/profile/picture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ avatar: dataUrl }),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Upload failed') }
        await refreshUser()
        setProfileMsg('Profile picture updated.')
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setProfileErr(err.message)
    } finally {
      setAvatarUpdating(false)
    }
  }

  const buildFullName = (fn, ln, mi, ext) => {
    const parts = [fn, mi, ln, ext].filter(Boolean)
    return parts.join(' ') || ''
  }

  const handleProfileSave = async () => {
    setSaving(true)
    setProfileMsg('')
    setProfileErr('')
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ firstName, lastName, middleInitial, extensionName, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      await refreshUser()
      setProfileMsg('Profile updated successfully.')
    } catch (err) {
      setProfileErr(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) { setPwdErr('Both fields are required.'); return }
    if (newPassword.length < 8) { setPwdErr('New password must be at least 8 characters.'); return }
    setChangingPwd(true)
    setPwdMsg('')
    setPwdErr('')
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Password change failed')
      setPwdMsg('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setPwdErr(err.message)
    } finally {
      setChangingPwd(false)
    }
  }

  useEffect(() => {
    fetch('/api/profile/auth-methods', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setHasPassword(d.hasPassword)
        setOauthProviders(d.oauthProviders || [])
      })
      .catch(() => {})
  }, [])

  const handleSetPassword = async () => {
    if (!newPassword || newPassword.length < 8) { setPwdErr('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPwd) { setPwdErr('Passwords do not match.'); return }
    setChangingPwd(true)
    setPwdMsg('')
    setPwdErr('')
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to set password')
      setPwdMsg('Password set successfully. You can now sign in with email too.')
      setNewPassword('')
      setConfirmPwd('')
      setHasPassword(true)
    } catch (err) {
      setPwdErr(err.message)
    } finally {
      setChangingPwd(false)
    }
  }

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/export/my-data', { credentials: 'include' })
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'my-data.json'; a.click()
      URL.revokeObjectURL(url)
    } catch {
      setProfileErr('Failed to export data.')
    }
  }

  const avatar = user?.avatar || ''

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'security', label: 'Security' },
    { id: 'export', label: 'Export' },
  ]

  const container = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, var(--table-header) 50%, #0f172a 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }

  return (
    <div style={container}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 28px' }}>Profile</h1>

        <div style={{ display: 'flex', gap: 4, marginBottom: 24, backgroundColor: 'var(--card-bg)', borderRadius: 12, padding: 4 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600,
              border: 'none', borderRadius: 8, cursor: 'pointer',
              backgroundColor: activeTab === tab.id ? 'var(--accent-bg)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent-text)' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'account' && (
          <div className="card-padding-mobile" style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 20, padding: 32, marginBottom: 24,
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
              <div style={{ position: 'relative' }}>
                {avatar ? (
                  <img src={avatar} alt="Avatar" style={{
                    width: 80, height: 80, borderRadius: '50%', objectFit: 'cover',
                    border: '2px solid var(--border-strong)',
                  }} />
                ) : (
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--border-strong)',
                  }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
                <button onClick={() => fileRef.current?.click()} disabled={avatarUpdating} style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#3b82f6', border: '2px solid #0f172a',
                  color: '#fff', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', padding: 0,
                  fontSize: 14, fontWeight: 700, lineHeight: 1,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 17, color: 'var(--text-primary)' }}>{buildFullName(user?.firstName, user?.lastName, user?.middleInitial, user?.extensionName) || user?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
              </div>
            </div>

            <div className="stack-mobile" style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>First Name</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" style={inputStyle} />
              </div>
            </div>
            <div className="stack-mobile" style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>Middle Initial <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input value={middleInitial} onChange={e => setMiddleInitial(e.target.value)} placeholder="e.g. M" style={inputStyle} maxLength={2} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>Extension <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input value={extensionName} onChange={e => setExtensionName(e.target.value)} placeholder="e.g. Jr., III" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: '11px 14px', fontSize: 14, backgroundColor: 'var(--track-bg)', border: '1px solid var(--border-strong)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {profileMsg && <div style={{ padding: '10px 14px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, color: '#86efac', fontSize: 13, marginBottom: 18 }}>{profileMsg}</div>}
            {profileErr && <div style={{ padding: '10px 14px', backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, color: '#fca5a5', fontSize: 13, marginBottom: 18 }}>{profileErr}</div>}

            <button onClick={handleProfileSave} disabled={saving} style={{
              padding: '12px 0', width: '100%', fontSize: 15, fontWeight: 700,
              backgroundColor: '#2563eb', color: '#fff', border: 'none',
              borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="card-padding-mobile" style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 20, padding: 32,
            backdropFilter: 'blur(12px)',
          }}>
            {hasPassword === null ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
            ) : hasPassword ? (
              <>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px' }}>Change Password</h2>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showCurrentPwd ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" style={{ width: '100%', padding: '11px 14px', paddingRight: 40, fontSize: 14, backgroundColor: 'var(--track-bg)', border: '1px solid var(--border-strong)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                    }}>
                      {showCurrentPwd ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showNewPwd ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters" style={{ width: '100%', padding: '11px 14px', paddingRight: 40, fontSize: 14, backgroundColor: 'var(--track-bg)', border: '1px solid var(--border-strong)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                    }}>
                      {showNewPwd ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                {pwdMsg && <div style={{ padding: '10px 14px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, color: '#86efac', fontSize: 13, marginBottom: 18 }}>{pwdMsg}</div>}
                {pwdErr && <div style={{ padding: '10px 14px', backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, color: '#fca5a5', fontSize: 13, marginBottom: 18 }}>{pwdErr}</div>}
                <button onClick={handlePasswordChange} disabled={changingPwd} style={{
                  padding: '12px 0', width: '100%', fontSize: 15, fontWeight: 700,
                  backgroundColor: 'transparent', color: 'var(--text-primary)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10, cursor: changingPwd ? 'not-allowed' : 'pointer',
                  opacity: changingPwd ? 0.6 : 1,
                }}>
                  {changingPwd ? 'Changing...' : 'Change Password'}
                </button>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px' }}>Set Password</h2>
                {oauthProviders.length > 0 && (
                  <div style={{ marginBottom: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    You currently sign in via <strong>{oauthProviders.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}</strong>.
                    Setting a password lets you also sign in with email.
                  </div>
                )}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showNewPwd ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters" style={{ width: '100%', padding: '11px 14px', paddingRight: 40, fontSize: 14, backgroundColor: 'var(--track-bg)', border: '1px solid var(--border-strong)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
                    <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                    }}>
                      {showNewPwd ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--label-color)' }}>Confirm Password</label>
                  <input type={showNewPwd ? 'text' : 'password'} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Re-enter password" style={{ width: '100%', padding: '11px 14px', fontSize: 14, backgroundColor: 'var(--track-bg)', border: '1px solid var(--border-strong)', borderRadius: 8, color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                {pwdMsg && <div style={{ padding: '10px 14px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, color: '#86efac', fontSize: 13, marginBottom: 18 }}>{pwdMsg}</div>}
                {pwdErr && <div style={{ padding: '10px 14px', backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, color: '#fca5a5', fontSize: 13, marginBottom: 18 }}>{pwdErr}</div>}
                <button onClick={handleSetPassword} disabled={changingPwd} style={{
                  padding: '12px 0', width: '100%', fontSize: 15, fontWeight: 700,
                  backgroundColor: '#2563eb', color: '#fff', border: 'none',
                  borderRadius: 10, cursor: changingPwd ? 'not-allowed' : 'pointer',
                  opacity: changingPwd ? 0.6 : 1,
                }}>
                  {changingPwd ? 'Setting...' : 'Set Password'}
                </button>
              </>
            )}
          </div>
        )}

        {activeTab === 'export' && (
          <div className="card-padding-mobile" style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 20, padding: 32,
            backdropFilter: 'blur(12px)',
          }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>Export Your Data</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 20px', lineHeight: 1.5 }}>
              Download all your profile information and assessment history as a JSON file.
            </p>
            <button onClick={handleExportData} style={{
              padding: '12px 24px', fontSize: 15, fontWeight: 700,
              backgroundColor: '#059669', color: '#fff', border: 'none',
              borderRadius: 10, cursor: 'pointer',
            }}>
              Download My Data
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 14px', fontSize: 14,
  backgroundColor: 'var(--track-bg)',
  border: '1px solid var(--border-strong)',
  borderRadius: 8, color: 'var(--text-primary)',
  outline: 'none', boxSizing: 'border-box',
}
