import { useState } from 'react'

export default function ConsentPage({ onConsent }) {
  const [agreed, setAgreed] = useState(false)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 480,
        animation: 'fadeInUp 0.6s ease-out both',
      }}>
        <div className="card-padding-mobile" style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 40,
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <img src="./logo.png" alt="DOrSU" style={{ height: 56, marginBottom: 16 }} />
            <h1 style={{
              fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0,
              letterSpacing: '-0.01em',
            }}>
              Data Privacy Consent
            </h1>
            <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 6 }}>
              Please review and agree to continue.
            </p>
          </div>

          <div style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: 20, marginBottom: 20,
            maxHeight: 280, overflowY: 'auto',
            fontSize: 13, lineHeight: 1.6, color: '#cbd5e1',
          }}>
            <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>
              DOrSU College Program Recommender System
            </p>
            <p style={{ margin: '0 0 12px' }}>
              In compliance with the Data Privacy Act of 2012 (RA 10173), we collect and process your personal data solely for generating personalized college program recommendations.
            </p>
            <p style={{ margin: '0 0 6px', color: '#f1f5f9', fontWeight: 600 }}>What we collect:</p>
            <ul style={{ margin: '0 0 12px', paddingLeft: 18 }}>
              <li>Name, school, SHS strand, and grades</li>
              <li>SUAST exam tiers and Holland personality assessment</li>
              <li>Career interests and skill self-assessments</li>
            </ul>
            <p style={{ margin: '0 0 6px', color: '#f1f5f9', fontWeight: 600 }}>How we protect it:</p>
            <ul style={{ margin: '0 0 12px', paddingLeft: 18 }}>
              <li>Data is stored securely and accessible only to authorized personnel</li>
              <li>Used exclusively for generating program recommendations</li>
              <li>Retained only as long as necessary for this purpose</li>
            </ul>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
              You have the right to access, rectify, or request deletion of your data by contacting the DOrSU Data Protection Officer.
            </p>
          </div>

          <label style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
            padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: 20,
          }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#2563eb', cursor: 'pointer', marginTop: 2, flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.4 }}>
              I have read and agree to the Data Privacy Notice and consent to the processing of my personal data.
            </span>
          </label>

          <button
            onClick={() => onConsent()}
            disabled={!agreed}
            style={{
              width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700,
              backgroundColor: agreed ? '#2563eb' : 'rgba(255,255,255,0.1)',
              color: '#fff', border: 'none', borderRadius: 10,
              cursor: agreed ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              opacity: agreed ? 1 : 0.5,
            }}
          >
            I Consent — Proceed
          </button>
        </div>
      </div>
    </div>
  )
}
