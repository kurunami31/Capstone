import { useState, useMemo } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import AuthPage from './components/AuthPage.jsx'
import LandingPage from './components/LandingPage.jsx'
import ConsentPage from './components/ConsentPage.jsx'
import Welcome from './components/Welcome.jsx'
import StrandStep from './components/StrandStep.jsx'
import GradesStep from './components/GradesStep.jsx'
import SUASTStep from './components/SUASTStep.jsx'
import HollandQuiz from './components/HollandQuiz.jsx'
import InterestStep from './components/InterestStep.jsx'
import SkillsStep from './components/SkillsStep.jsx'
import Results from './components/Results.jsx'
import { calculateRecommendations } from './engine/scoring.js'
import { calculateHollandCode } from './engine/holland.js'
import programs from './data/programs.json'

const STEPS = [
  'consent', 'welcome', 'strand', 'grades', 'suast', 'holland', 'interest', 'skills', 'results'
]

const STEP_LABELS = [
  'Consent', 'Welcome', 'SHS Strand', 'Grades', 'SUAST Exam',
  'Personality', 'Interests', 'Skills', 'Results'
]

function AppContent() {
  const { user, loading, logout } = useAuth()
  const [showLanding, setShowLanding] = useState(true)
  const [step, setStep] = useState(0)
  const [studentData, setStudentData] = useState({
    name: '', school: '', strand: '',
    grades: {}, strandSpecificGrades: {}, gwa: 0,
    suastTiers: {}, hollandAnswers: {}, hollandScores: [],
    interests: {}, skills: {},
  })

  const currentStep = STEPS[step]

  const hollandCode = useMemo(() => {
    if (studentData.hollandScores && Object.keys(studentData.hollandScores).length > 0) {
      return calculateHollandCode(studentData.hollandScores)
    }
    return null
  }, [studentData.hollandScores])

  const results = useMemo(() => {
    if (currentStep === 'results') {
      return calculateRecommendations({ ...studentData, hollandCode }, programs)
    }
    return null
  }, [currentStep, studentData, hollandCode])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        color: '#94a3b8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 15,
      }}>
        Loading...
      </div>
    )
  }

  const updateData = (updates) => {
    setStudentData(prev => ({ ...prev, ...updates }))
  }

  const handleConsent = () => {
    setStep(1)
  }

  const handleStart = (name, school) => {
    updateData({ name, school })
    setStep(2)
  }

  const handleGetStarted = () => {
    setShowLanding(false)
    setStep(0)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'consent': return <ConsentPage onConsent={handleConsent} />
      case 'welcome': return <Welcome onStart={handleStart} />
      case 'strand': return <StrandStep data={studentData} onUpdate={updateData} onNext={() => setStep(3)} />
      case 'grades': return <GradesStep data={studentData} onUpdate={updateData} onNext={() => setStep(4)} onBack={() => setStep(2)} />
      case 'suast': return <SUASTStep data={studentData} onUpdate={updateData} onNext={() => setStep(5)} onBack={() => setStep(3)} />
      case 'holland': return <HollandQuiz data={studentData} onUpdate={updateData} onNext={() => setStep(6)} onBack={() => setStep(4)} />
      case 'interest': return <InterestStep data={studentData} onUpdate={updateData} onNext={() => setStep(7)} onBack={() => setStep(5)} />
      case 'skills': return <SkillsStep data={studentData} onUpdate={updateData} onNext={() => setStep(8)} onBack={() => setStep(6)} />
      case 'results': return (
        <Results
          studentData={studentData} results={results}
          onRestart={() => {
            setStudentData({ name: '', school: '', strand: '', grades: {}, strandSpecificGrades: {}, gwa: 0, suastTiers: {}, hollandAnswers: {}, hollandScores: [], interests: {}, skills: {} })
            setStep(0)
            setShowLanding(true)
          }}
        />
      )
      default: return null
    }
  }

  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} user={user} onLogout={logout} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {currentStep !== 'results' && (
          <div style={{ padding: '20px 0 12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>{user.name}</span>
              <button onClick={logout} style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8',
                fontSize: 12, padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
              }}>
                Sign Out
              </button>
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              {STEPS.slice(0, -1).map((s, i) => (
                <div key={s} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  backgroundColor: i < step ? '#3b82f6' : i === step ? '#1e40af' : 'rgba(255,255,255,0.1)',
                  transition: 'background-color 0.3s',
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
              {STEP_LABELS.slice(0, -1).map((l, i) => (
                <span key={l} style={{ fontWeight: i <= step ? 600 : 400 }}>{l}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 32,
          border: '1px solid rgba(255,255,255,0.06)', marginTop: 12, marginBottom: 40,
          backdropFilter: 'blur(8px)',
        }}>
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
