import { useState } from 'react'

const QUESTIONS = [
  { id: 1, question: 'Do you prefer working indoors or outdoors?', a: 'Indoors', b: 'Outdoors', map: { a: ['I', 'C'], b: ['R', 'S'] } },
  { id: 2, question: 'Do you enjoy working with data or with people?', a: 'Data', b: 'People', map: { a: ['I', 'C'], b: ['S', 'E'] } },
  { id: 3, question: 'Would you rather create something new or analyze existing things?', a: 'Create', b: 'Analyze', map: { a: ['A', 'E'], b: ['I', 'C'] } },
  { id: 4, question: 'Do you prefer leading a team or following instructions?', a: 'Lead', b: 'Follow', map: { a: ['E', 'S'], b: ['C', 'R'] } },
  { id: 5, question: 'Do you enjoy building/repairing things or designing/planning?', a: 'Build', b: 'Design', map: { a: ['R'], b: ['A', 'I'] } },
]

const LABELS = {
  R: 'Realistic', I: 'Investigative', A: 'Artistic',
  S: 'Social', E: 'Enterprising', C: 'Conventional',
}

const COLORS = {
  R: '#3b82f6', I: '#8b5cf6', A: '#ec4899',
  S: '#f59e0b', E: '#10b981', C: '#06b6d4',
}

export default function QuickQuiz({ onClose }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [scores, setScores] = useState({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 })
  const [done, setDone] = useState(false)

  const answer = (choice) => {
    const q = QUESTIONS[currentQ]
    const mapped = q.map[choice]
    const next = { ...scores }
    for (const code of mapped) {
      next[code] = (next[code] || 0) + 1
    }
    setScores(next)
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1)
    } else {
      setDone(true)
    }
  }

  const top3 = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([code]) => code)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        backgroundColor: '#1e293b', borderRadius: 20, padding: 32,
        maxWidth: 440, width: '100%',
        border: '1px solid rgba(255,255,255,0.08)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        {!done ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Question {currentQ + 1} of {QUESTIONS.length}
              </span>
              <button onClick={onClose} style={{
                background: 'none', border: 'none', color: '#94a3b8',
                cursor: 'pointer', fontSize: 18, padding: '0 4px',
              }}>✕</button>
            </div>
            <div style={{
              height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.06)',
              marginBottom: 24, overflow: 'hidden',
            }}>
              <div style={{
                width: `${((currentQ) / QUESTIONS.length) * 100}%`, height: '100%',
                backgroundColor: '#3b82f6', borderRadius: 2,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <h3 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, margin: '0 0 24px', lineHeight: 1.4 }}>
              {QUESTIONS[currentQ].question}
            </h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => answer('a')} style={btnStyle}>
                {QUESTIONS[currentQ].a}
              </button>
              <button onClick={() => answer('b')} style={btnStyle}>
                {QUESTIONS[currentQ].b}
              </button>
            </div>
          </>
        ) : (
          <>
            <button onClick={onClose} style={{
              float: 'right', background: 'none', border: 'none',
              color: '#94a3b8', cursor: 'pointer', fontSize: 18, padding: '0 4px',
            }}>✕</button>
            <h3 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
              Your Quick Personality
            </h3>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 20px', lineHeight: 1.5 }}>
              Based on your answers, your top Holland codes are:
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
              {top3.map((code, i) => (
                <div key={code} style={{
                  width: 56, height: 56, borderRadius: 16,
                  backgroundColor: `${COLORS[code]}22`,
                  border: `2px solid ${COLORS[code]}`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: COLORS[code] }}>{code}</span>
                  <span style={{ fontSize: 9, color: '#94a3b8' }}>{LABELS[code]}</span>
                </div>
              ))}
            </div>
            <p style={{ color: '#64748b', fontSize: 12, textAlign: 'center', lineHeight: 1.5 }}>
              This is a simplified indicator. Take the full assessment for a comprehensive analysis.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

const btnStyle = {
  flex: 1, padding: '16px 0', fontSize: 15, fontWeight: 600,
  backgroundColor: 'rgba(255,255,255,0.06)', color: '#f1f5f9',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12, cursor: 'pointer',
  transition: 'all 0.15s',
}
