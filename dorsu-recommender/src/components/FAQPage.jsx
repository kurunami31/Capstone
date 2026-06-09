import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation.js'

const faqs = [
  {
    q: 'What is the DOrSU College Program Recommender?',
    a: 'It is a web-based system that helps incoming college students find the best college programs at Davao Oriental State University (DOrSU) based on their SHS strand, grades, aptitude test results, personality type, interests, and skills.',
  },
  {
    q: 'How does the assessment work?',
    a: 'The assessment has 8 steps: (1) Data Privacy Consent, (2) Your name and school, (3) SHS strand selection, (4) Grade input, (5) SUAST exam simulation, (6) Holland personality quiz, (7) Interest areas, and (8) Skills self-assessment. After completing all steps, you receive a ranked list of recommended programs.',
  },
  {
    q: 'What is the Holland Code personality test?',
    a: 'The Holland Code (RIASEC model) categorizes personalities into six types: Realistic, Investigative, Artistic, Social, Enterprising, and Conventional. The system uses your Holland Code to match you with programs that fit your personality.',
  },
  {
    q: 'What is the SUAST exam?',
    a: 'SUAST stands for the DOrSU Scholastic Aptitude Test. The system simulates your performance across several aptitude areas. This helps determine which programs align with your academic strengths.',
  },
  {
    q: 'What information do I need to provide?',
    a: 'You need your SHS strand, grades from core subjects, and honest answers to the personality, interest, and skills assessments. All information is processed locally and stored securely.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Yes. The system complies with the Data Privacy Act of 2012 (RA 10173). Your data is stored securely and used only for generating program recommendations. You can review the full Data Privacy Notice before starting the assessment, and your consent is required to proceed.',
  },
  {
    q: 'Can I retake the assessment?',
    a: 'Yes. After viewing your results, you can click the "Start Over" button to retake the assessment with a fresh set of answers.',
  },
  {
    q: 'How are program matches calculated?',
    a: 'The system uses a scoring algorithm that considers your SHS strand alignment, grade point average (GWA), Holland Code compatibility, interest match, and skills alignment. Each program is scored across these dimensions and ranked by total match percentage.',
  },
  {
    q: 'Do I need an account to use the system?',
    a: 'Yes. You must register with your name, email, and a password. This allows you to access the assessment and view your results. Your account also lets you update your profile and change your password.',
  },
  {
    q: 'Who can I contact for support?',
    a: 'For questions about the system or your results, please contact the DOrSU Office of Admissions or send an email through the university\'s official communication channels.',
  },
]

export default function FAQPage() {
  const { t } = useTranslation()
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, var(--table-header) 50%, #0f172a 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 28px' }}>{t('nav.faq')}</h1>

        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 20, padding: 24,
          backdropFilter: 'blur(12px)',
        }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              borderBottom: i < faqs.length - 1 ? '1px solid var(--track-bg)' : 'none',
            }}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                style={{
                  width: '100%', background: 'none', border: 'none',
                  padding: '16px 8px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  textAlign: 'left', color: 'var(--text-primary)', fontSize: 15, fontWeight: 600,
                  fontFamily: 'inherit', gap: 12,
                }}
              >
                <span style={{ flex: 1 }}>{faq.q}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {openIdx === i && (
                <div style={{
                  padding: '0 8px 16px', fontSize: 14, color: 'var(--text-secondary)',
                  lineHeight: 1.7, animation: 'fadeIn 0.2s ease-out',
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
