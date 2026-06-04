import generatePDF from './Report.jsx'

function codeColor(score) {
  if (score >= 80) return '#34d399'
  if (score >= 60) return '#fbbf24'
  return '#f87171'
}

function admissionColor(level) {
  if (level === 'High') return '#34d399'
  if (level === 'Moderate') return '#fbbf24'
  return '#f87171'
}

export default function Results({ studentData, results, onRestart }) {
  if (!results || results.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <h2 style={{ color: '#f1f5f9' }}>No recommendations available</h2>
        <p style={{ color: '#64748b' }}>Please complete the assessment first.</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, margin: 0, color: '#f1f5f9' }}>Your Top Program Matches</h2>
          <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: 14 }}>
            {studentData.name} | {studentData.strand} Strand | GWA: {studentData.gwa}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => generatePDF(studentData, results)} style={pdfBtn}>Download PDF</button>
          <button onClick={onRestart} style={restartBtn}>Start Over</button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {results.map((r) => (
          <div key={r.program.code} style={{
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20,
            backgroundColor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  backgroundColor: codeColor(r.totalScore), color: '#0f172a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16
                }}>
                  {r.rank}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16, color: '#f1f5f9' }}>{r.program.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{r.program.faculty}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: codeColor(r.totalScore) }}>
                  {r.totalScore}%
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Overall Match</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
              <div style={{ flex: 1, minWidth: 60 }}>
                <div style={statBox}>
                  <span style={statLabel}>Academic</span>
                  <span style={{ ...statValue, color: codeColor(r.breakdown.academic) }}>{r.breakdown.academic}%</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 60 }}>
                <div style={statBox}>
                  <span style={statLabel}>SUAST</span>
                  <span style={{ ...statValue, color: codeColor(r.breakdown.suast) }}>{r.breakdown.suast}%</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 60 }}>
                <div style={statBox}>
                  <span style={statLabel}>Personal Fit</span>
                  <span style={{ ...statValue, color: codeColor(r.breakdown.personalFit) }}>{r.breakdown.personalFit}%</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 100 }}>
                <div style={{
                  ...statBox, border: `2px solid ${admissionColor(r.admission.label)}`,
                  backgroundColor: `${admissionColor(r.admission.label)}15`
                }}>
                  <span style={statLabel}>Admission Chance</span>
                  <span style={{ ...statValue, color: admissionColor(r.admission.label) }}>
                    {r.admission.label}
                  </span>
                </div>
              </div>
            </div>

            {r.program.ched_priority && (
              <div style={{ fontSize: 12, color: '#60a5fa', backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)', padding: '4px 10px', borderRadius: 4, display: 'inline-block' }}>
                CHED Priority Course
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const statBox = {
  padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
}
const statLabel = { display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }
const statValue = { display: 'block', fontWeight: 700, fontSize: 18 }

const pdfBtn = {
  padding: '10px 24px', fontSize: 14, fontWeight: 600,
  backgroundColor: '#059669', color: '#fff',
  border: 'none', borderRadius: 8, cursor: 'pointer',
}
const restartBtn = {
  padding: '10px 24px', fontSize: 14, fontWeight: 600,
  backgroundColor: 'rgba(255,255,255,0.04)', color: '#94a3b8',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer',
}
