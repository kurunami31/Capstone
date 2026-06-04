import { useState } from 'react'

export default function ConsentPage({ onConsent }) {
  const [agreed, setAgreed] = useState(false)

  return (
    <div>
      <h2 style={{ fontSize: 24, marginBottom: 4, color: '#f1f5f9' }}>
        Welcome, future DOrSU student!
      </h2>
      <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: 14 }}>
        Before we begin, please review and consent to the Data Privacy Notice below.
      </p>

      <div style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: 24, marginBottom: 24,
        maxHeight: 340, overflowY: 'auto',
        fontSize: 13, lineHeight: 1.7, color: '#cbd5e1',
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginTop: 0, marginBottom: 12 }}>
          DATA PRIVACY NOTICE AND CONSENT FORM
        </h3>

        <p><strong>Davao Oriental State University (DOrSU)</strong> — College Program Recommender System</p>

        <p style={{ marginTop: 14 }}>
          In compliance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong> and its Implementing Rules and Regulations, we at Davao Oriental State University value your privacy and are committed to protecting your personal data.
        </p>

        <h4 style={{ color: '#f1f5f9', margin: '16px 0 6px' }}>Purpose of Data Collection</h4>
        <p>
          The personal information you provide will be used exclusively for the purpose of generating personalized college program recommendations. This includes:
        </p>
        <ul style={{ paddingLeft: 20, margin: '6px 0' }}>
          <li>Evaluating your academic profile (SHS strand, grades, and aptitude)</li>
          <li>Assessing your career personality, interests, and skills</li>
          <li>Generating a ranked list of compatible DOrSU college programs</li>
          <li>Improving the recommender system for future students</li>
        </ul>

        <h4 style={{ color: '#f1f5f9', margin: '16px 0 6px' }}>Information Collected</h4>
        <p>
          We collect your name, school, SHS strand, academic grades, SUAST examination tiers, personality assessment responses, career interest ratings, and self-assessed skill levels. No sensitive personal information as defined under RA 10173 is intentionally collected.
        </p>

        <h4 style={{ color: '#f1f5f9', margin: '16px 0 6px' }}>Data Protection and Storage</h4>
        <p>
          Your data is stored securely and is accessible only to authorized personnel of DOrSU for the purposes stated above. We implement appropriate organizational, physical, and technical security measures to protect your information against unauthorized access, disclosure, alteration, or destruction.
        </p>

        <h4 style={{ color: '#f1f5f9', margin: '16px 0 6px' }}>Your Rights</h4>
        <p>
          Under the Data Privacy Act, you have the right to be informed, to access, to object, to erasure or blocking, to rectify, to file a complaint, and to data portability. You may exercise these rights by contacting the DOrSU Data Protection Officer.
        </p>

        <h4 style={{ color: '#f1f5f9', margin: '16px 0 6px' }}>Retention Period</h4>
        <p>
          Your personal data will be retained only for as long as necessary to fulfill the purposes for which it was collected, or as required by applicable law.
        </p>

        <p style={{ marginTop: 16, fontStyle: 'italic', color: '#94a3b8' }}>
          By checking the box below and proceeding, you acknowledge that you have read, understood, and freely give your consent to the collection, use, and processing of your personal data as described in this notice.
        </p>
      </div>

      <label style={{
        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 24,
      }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: '#2563eb', cursor: 'pointer' }}
        />
        <span style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.4 }}>
          I have read and agree to the Data Privacy Notice and consent to the processing of my personal data for the purpose of the College Program Recommender System.
        </span>
      </label>

      <button
        onClick={() => onConsent()}
        disabled={!agreed}
        style={{
          width: '100%', padding: '14px 0', fontSize: 16, fontWeight: 700,
          backgroundColor: agreed ? '#2563eb' : 'rgba(255,255,255,0.1)',
          color: '#fff', border: 'none', borderRadius: 10,
          cursor: agreed ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
        }}
      >
        I Consent — Proceed to Assessment
      </button>
    </div>
  )
}
