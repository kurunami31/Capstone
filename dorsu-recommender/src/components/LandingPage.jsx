export default function LandingPage({ onGetStarted }) {
  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #1a56db 0%, #1e40af 100%)',
        color: '#fff', textAlign: 'center',
        padding: '100px 24px 70px',
      }}>
        <img src="./logo.png" alt="DOrSU Logo" style={{ height: 140, marginBottom: 20 }} />
        <h1 style={{
          fontSize: 40, fontWeight: 800, marginBottom: 14,
          letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          DOrSU College Program Recommender
        </h1>
        <p style={{
          fontSize: 20, fontWeight: 400, opacity: 0.9,
          marginBottom: 8, lineHeight: 1.5, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto',
        }}>
          Find the best college programs at Davao Oriental State University
          that match your unique strengths and interests.
        </p>
        <p style={{ fontSize: 14, opacity: 0.75, marginBottom: 36 }}>
          SHS Strand &bull; Grades &bull; Aptitude &bull; Personality &bull; Interests &bull; Skills
        </p>
        <button
          onClick={onGetStarted}
          style={{
            padding: '16px 56px', fontSize: 18, fontWeight: 700,
            backgroundColor: '#fff', color: '#1a56db',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}
        >
          Get Started
        </button>
      </div>

      <div style={{
        maxWidth: 800, margin: '0 auto', padding: '60px 24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <h2 style={{
          fontSize: 24, fontWeight: 700, color: '#1e293b',
          textAlign: 'center', marginBottom: 8,
        }}>
          How It Works
        </h2>
        <p style={{
          fontSize: 15, color: '#64748b', marginBottom: 36,
          textAlign: 'center', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto',
        }}>
          A comprehensive 6-step assessment to match you with the right college program.
        </p>
        <div style={{
          display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {[
            { num: '1', title: 'Your Profile', desc: 'Enter your SHS strand and grades to establish your academic foundation.' },
            { num: '2', title: 'Aptitude & Personality', desc: 'Assess your SUAST performance, Holland personality code, and interests.' },
            { num: '3', title: 'Your Matches', desc: 'Get a ranked list of programs with match scores and admission chances.' },
          ].map(s => (
            <div key={s.num} style={{
              flex: '1 1 200px', maxWidth: 240,
              padding: 28, backgroundColor: '#f8fafc', borderRadius: 12, textAlign: 'center',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                backgroundColor: '#1a56db', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 18, margin: '0 auto 14px',
              }}>
                {s.num}
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#1e293b', marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        borderTop: '1px solid #e2e8f0', padding: '24px',
        textAlign: 'center', fontSize: 13, color: '#94a3b8',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        Davao Oriental State University &mdash; College Program Recommender System
      </div>
    </div>
  )
}
