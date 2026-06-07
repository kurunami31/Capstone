import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [firstName, setFirstName] = useState(user?.firstName || user?.first_name || '')
  const [lastName, setLastName] = useState(user?.lastName || user?.last_name || '')
  const [middleInitial, setMiddleInitial] = useState(user?.middleInitial || user?.middle_initial || '')
  const [extensionName, setExtensionName] = useState(user?.extensionName || user?.extension_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')
  const [avatarUpdating, setAvatarUpdating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [changingPwd, setChangingPwd] = useState(false)
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

  const avatar = user?.avatar || ''

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 28px' }}>Profile</h1>

        <div className="card-padding-mobile" style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 32, marginBottom: 24,
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
            <div style={{ position: 'relative' }}>
              {avatar ? (
                <img src={avatar} alt="Avatar" style={{
                  width: 80, height: 80, borderRadius: '50%', objectFit: 'cover',
                  border: '2px solid rgba(255,255,255,0.1)',
                }} />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.1)',
                }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
              <div style={{ fontWeight: 600, fontSize: 17, color: '#f1f5f9' }}>{buildFullName(user?.firstName, user?.lastName, user?.middleInitial, user?.extensionName) || user?.name}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{user?.email}</div>
            </div>
          </div>

          <div className="stack-mobile" style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>First Name</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name"
                style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Last Name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name"
                style={inputStyle} />
            </div>
          </div>
          <div className="stack-mobile" style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Middle Initial <span style={{ color: '#64748b', fontWeight: 400 }}>(optional)</span></label>
              <input value={middleInitial} onChange={e => setMiddleInitial(e.target.value)} placeholder="e.g. M"
                style={inputStyle} maxLength={2} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Extension <span style={{ color: '#64748b', fontWeight: 400 }}>(optional)</span></label>
              <input value={extensionName} onChange={e => setExtensionName(e.target.value)} placeholder="e.g. Jr., III"
                style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Email Address</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              style={{ width: '100%', padding: '11px 14px', fontSize: 14, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', outline: 'none', boxSizing: 'border-box' }} />
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

        {user?.role !== 'admin' && (
        <div className="card-padding-mobile" style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 32,
          backdropFilter: 'blur(12px)',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px' }}>Change Password</h2>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password"
              style={{ width: '100%', padding: '11px 14px', fontSize: 14, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters"
              style={{ width: '100%', padding: '11px 14px', fontSize: 14, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {pwdMsg && <div style={{ padding: '10px 14px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, color: '#86efac', fontSize: 13, marginBottom: 18 }}>{pwdMsg}</div>}
          {pwdErr && <div style={{ padding: '10px 14px', backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, color: '#fca5a5', fontSize: 13, marginBottom: 18 }}>{pwdErr}</div>}

          <button onClick={handlePasswordChange} disabled={changingPwd} style={{
            padding: '12px 0', width: '100%', fontSize: 15, fontWeight: 700,
            backgroundColor: 'transparent', color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10, cursor: changingPwd ? 'not-allowed' : 'pointer',
            opacity: changingPwd ? 0.6 : 1,
          }}>
            {changingPwd ? 'Changing...' : 'Change Password'}
          </button>
        </div>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 14px', fontSize: 14,
  backgroundColor: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, color: '#f1f5f9',
  outline: 'none', boxSizing: 'border-box',
}
