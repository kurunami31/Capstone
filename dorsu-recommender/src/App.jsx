import { useState, useMemo } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import AuthPage from './components/AuthPage.jsx'
import Sidebar from './components/Sidebar.jsx'
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
import ProfilePage from './components/ProfilePage.jsx'
import FAQPage from './components/FAQPage.jsx'
import AdminPage from './components/AdminPage.jsx'
import ChatWidget from './components/ChatWidget.jsx'
import { calculateRecommendations } from './engine/scoring.js'
import { calculateHollandCode } from './engine/holland.js'
import programs from './data/programs.json'

const STEPS = [
  'welcome', 'strand', 'grades', 'suast', 'holland', 'interest', 'skills', 'results'
]

const STEP_LABELS = [
  'Welcome', 'SHS Strand', 'Grades', 'SUAST Exam',
  'Personality', 'Interests', 'Skills', 'Results'
]

function AppContent() {
  const { user, loading, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [consented, setConsented] = useState(false)
  const [showLanding, setShowLanding] = useState(true)
  const [showProfile, setShowProfile] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
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

  const updateData = (updates) => {
    setStudentData(prev => ({ ...prev, ...updates }))
  }

  const handleStart = (school) => {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
    updateData({ name: fullName, school }); setStep(1)
  }
  const handleGetStarted = () => { setShowLanding(false); setShowProfile(false); setShowFAQ(false); setShowAdmin(false); setStep(0) }
  const handleShowProfile = () => { setShowProfile(true); setShowLanding(false); setShowFAQ(false); setShowAdmin(false) }
  const handleBackFromProfile = () => setShowProfile(false)
  const handleShowFAQ = () => { setShowFAQ(true); setShowLanding(false); setShowProfile(false); setShowAdmin(false) }
  const handleBackFromFAQ = () => setShowFAQ(false)
  const handleShowAdmin = () => { setShowAdmin(true); setShowLanding(false); setShowProfile(false); setShowFAQ(false) }
  const handleBackFromAdmin = () => setShowAdmin(false)
  const handleGoHome = () => { setShowLanding(true); setShowProfile(false); setShowFAQ(false); setShowAdmin(false) }

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

  if (!user) return <AuthPage />

  if (!consented) return <ConsentPage onConsent={() => setConsented(true)} />

  let activePage = 'home'
  if (showProfile) activePage = 'profile'
  else if (showFAQ) activePage = 'faq'
  else if (showAdmin) activePage = 'admin'
  else if (!showLanding) activePage = 'assessment'

  const renderAssessmentProgress = () => {
    if (currentStep === 'results') return null
    return (
      <div style={{ padding: '20px 0 12px' }}>
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
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome': return <Welcome onStart={handleStart} />
      case 'strand': return <StrandStep data={studentData} onUpdate={updateData} onNext={() => setStep(2)} />
      case 'grades': return <GradesStep data={studentData} onUpdate={updateData} onNext={() => setStep(3)} onBack={() => setStep(1)} />
      case 'suast': return <SUASTStep data={studentData} onUpdate={updateData} onNext={() => setStep(4)} onBack={() => setStep(2)} />
      case 'holland': return <HollandQuiz data={studentData} onUpdate={updateData} onNext={() => setStep(5)} onBack={() => setStep(3)} />
      case 'interest': return <InterestStep data={studentData} onUpdate={updateData} onNext={() => setStep(6)} onBack={() => setStep(4)} />
      case 'skills': return <SkillsStep data={studentData} onUpdate={updateData} onNext={() => setStep(7)} onBack={() => setStep(5)} />
      case 'results': return null
      default: return null
    }
  }

  let mainContent = null

  if (showProfile) {
    mainContent = <ProfilePage />
  } else if (showFAQ) {
    mainContent = <FAQPage />
  } else if (showAdmin) {
    mainContent = <AdminPage />
  } else if (showLanding) {
    mainContent = <LandingPage onGetStarted={handleGetStarted} />
  } else {
    mainContent = (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          {renderAssessmentProgress()}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 32,
            border: '1px solid rgba(255,255,255,0.06)', marginTop: currentStep !== 'results' ? 4 : 0, marginBottom: 40,
            backdropFilter: 'blur(8px)',
          }}>
            {currentStep === 'results' ? (
              <Results
                studentData={studentData} results={results}
                onRestart={() => {
                  setStudentData({ name: '', school: '', strand: '', grades: {}, strandSpecificGrades: {}, gwa: 0, suastTiers: {}, hollandAnswers: {}, hollandScores: [], interests: {}, skills: {} })
                  setStep(0)
                  setShowLanding(true)
                }}
              />
            ) : renderStep()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        user={user}
        activePage={activePage}
        onHome={handleGoHome}
        onAssessment={handleGetStarted}
        onProfile={handleShowProfile}
        onFAQ={handleShowFAQ}
        onAdmin={handleShowAdmin}
        onLogout={logout}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div style={{ flex: 1, marginLeft: sidebarOpen ? 220 : 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', transition: 'margin-left 0.3s ease' }}>
        {mainContent}
      </div>
      <ChatWidget />
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
