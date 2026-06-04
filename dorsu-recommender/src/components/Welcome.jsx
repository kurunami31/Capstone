import { useState } from 'react'

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #1a56db 0%, #1e40af 100%)',
    color: '#fff', textAlign: 'center',
    padding: '80px 24px 60px',
    margin: '-32px -32px 0',
    borderRadius: '12px 12px 0 0',
  },
  heroTitle: {
    fontSize: 36, fontWeight: 800, marginBottom: 12,
    letterSpacing: '-0.02em', lineHeight: 1.2,
  },
  heroSub: {
    fontSize: 18, fontWeight: 400, opacity: 0.9,
    marginBottom: 8, lineHeight: 1.5,
  },
  heroTagline: {
    fontSize: 14, opacity: 0.75, marginBottom: 0,
  },
  section: {
    padding: '48px 24px',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22, fontWeight: 700, color: '#1e293b',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14, color: '#64748b', marginBottom: 32,
    maxWidth: 500, marginLeft: 'auto', marginRight: 'auto',
  },
  steps: {
    display: 'flex', gap: 16, justifyContent: 'center',
      flexWrap: 'wrap',
  },
  stepCard: {
    flex: '1 1 200px', maxWidth: 240,
    padding: 24, backgroundColor: '#f8fafc',
    borderRadius: 12,     textAlign: 'center',
  },
  stepNum: {
    width: 36, height: 36, borderRadius: '50%',
    backgroundColor: '#1a56db', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 16, margin: '0 auto 12px',
  },
  stepTitle: {
    fontWeight: 600, fontSize: 15, color: '#1e293b', marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13, color: '#64748b', lineHeight: 1.4,
  },
  formBox: {
    maxWidth: 420, margin: '0 auto',
    textAlign: 'left',
  },
  label: {
    display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14, color: '#334155',
  },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #cbd5e1', fontSize: 14,
    outline: 'none',     boxSizing: 'border-box',
  },
  ctaBtn: {
    width: '100%', padding: '14px 0', fontSize: 16, fontWeight: 700,
    border: 'none', borderRadius: 8, cursor: 'pointer',
    marginTop: 8,
  },
  footer: {
    borderTop: '1px solid #e2e8f0', padding: '24px',
    textAlign: 'center', fontSize: 13, color: '#94a3b8',
    margin: '0 -32px -32px',
  },
}

export default function Welcome({ onStart }) {
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')

  return (
    <div>
      <div style={styles.hero}>
        <img src="./logo.png" alt="DOrSU Logo" style={{ height: 64, marginBottom: 16 }} />
        <h1 style={styles.heroTitle}>DOrSU College Program Recommender</h1>
        <p style={styles.heroSub}>
          Find the best college programs at Davao Oriental State University
          that match your unique strengths and interests.
        </p>
        <p style={styles.heroTagline}>
          SHS Strand &bull; Grades &bull; Aptitude &bull; Personality &bull; Interests &bull; Skills
        </p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <p style={styles.sectionDesc}>
          A comprehensive 6-step assessment to match you with the right college program.
        </p>
        <div style={styles.steps}>
          <div style={styles.stepCard}>
            <div style={styles.stepNum}>1</div>
            <div style={styles.stepTitle}>Your Profile</div>
            <div style={styles.stepDesc}>Enter your SHS strand and grades to establish your academic foundation.</div>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNum}>2</div>
            <div style={styles.stepTitle}>Aptitude &amp; Personality</div>
            <div style={styles.stepDesc}>Assess your SUAST performance, Holland personality code, and interests.</div>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNum}>3</div>
            <div style={styles.stepTitle}>Your Matches</div>
            <div style={styles.stepDesc}>Get a ranked list of programs with match scores and admission chances.</div>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Get Started</h2>
        <p style={styles.sectionDesc}>
          Enter your details below to begin the assessment.
        </p>
        <div style={styles.formBox}>
          <div style={{ marginBottom: 16 }}>
            <label style={styles.label}>Your Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your full name"
              style={styles.input}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={styles.label}>School (optional)</label>
            <input
              value={school}
              onChange={e => setSchool(e.target.value)}
              placeholder="Your SHS school name"
              style={styles.input}
            />
          </div>
          <button
            onClick={() => onStart(name, school)}
            disabled={!name.trim()}
            style={{
              ...styles.ctaBtn,
              backgroundColor: name.trim() ? '#1a56db' : '#94a3b8',
              color: '#fff',
            }}
          >
            Start Assessment
          </button>
        </div>
      </div>

      <div style={styles.footer}>
        Davao Oriental State University &mdash; College Program Recommender System
      </div>
    </div>
  )
}
