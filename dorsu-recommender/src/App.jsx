import { useState, useMemo, useEffect, useRef } from 'react'
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
import HistoryPage from './components/HistoryPage.jsx'
import UserDashboard from './components/UserDashboard.jsx'
import NotificationsPage from './components/NotificationsPage.jsx'
import ProgramsPage from './components/ProgramsPage.jsx'
import SettingsPage from './components/SettingsPage.jsx'
import QuestionsManager from './components/QuestionsManager.jsx'
import CounselorDashboard from './components/CounselorDashboard.jsx'
import ChatWidget from './components/ChatWidget.jsx'
import OnboardingWalkthrough from './components/OnboardingWalkthrough.jsx'
import SkeletonLoader, { SkeletonCard } from './components/SkeletonLoader.jsx'
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
  const [systemSettings, setSystemSettings] = useState({})
  const [activePrograms, setActivePrograms] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = (e) => { setIsMobile(e.matches); if (e.matches) setSidebarOpen(false) }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  useEffect(() => {
    if (!user) return
    fetch('/api/settings', { credentials: 'include' })
      .then(r => r.json()).then(setSystemSettings).catch(err => console.error('Failed to fetch system settings', err))
    fetch('/api/programs/status', { credentials: 'include' })
      .then(r => r.json()).then(setActivePrograms).catch(err => console.error('Failed to fetch active programs', err))
  }, [user])

  const [consented, setConsented] = useState(false)
  const [showLanding, setShowLanding] = useState(false)
  const [showDashboard, setShowDashboard] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showPrograms, setShowPrograms] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showQuestions, setShowQuestions] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [step, setStep] = useState(0)
  const [studentData, setStudentData] = useState({
    name: '', school: '', strand: '',
    grades: {}, strandSpecificGrades: {}, gwa: 0,
    suastTiers: {}, hollandAnswers: {}, hollandScores: [],
    interests: {}, skills: {},
  })
  const [savedProgress, setSavedProgress] = useState(null)
  const [showResumePrompt, setShowResumePrompt] = useState(false)
  const [emailVerified, setEmailVerified] = useState(true)
  const [smtpConfigured, setSmtpConfigured] = useState(false)
  const [verifMsg, setVerifMsg] = useState('')
  const autoSaveRef = useRef(null)

  // Check email verification status
  useEffect(() => {
    if (!user) return
    fetch('/api/email-verified', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setEmailVerified(data.verified)
        setSmtpConfigured(data.smtpConfigured)
      })
      .catch(() => {})
  }, [user])

  // Check for saved progress on mount
  useEffect(() => {
    if (!user) return
    fetch('/api/assessment/progress', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.progress) setSavedProgress(data.progress)
      })
      .catch(err => console.error('Failed to check saved progress', err))
  }, [user])

  // Auto-save progress when step changes (skip step 0 = fresh start)
  useEffect(() => {
    if (!user || step === 0 || showLanding) return
    if (currentStep === 'results') return
    autoSaveRef.current = setTimeout(() => {
      fetch('/api/assessment/progress', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, data: studentData }),
      }).catch(err => console.error('Failed to auto-save progress', err))
    }, 500)
    return () => clearTimeout(autoSaveRef.current)
  }, [step, studentData, user, showLanding])

  const currentStep = STEPS[step]

  const hollandCode = useMemo(() => {
    if (studentData.hollandScores && Object.keys(studentData.hollandScores).length > 0) {
      return calculateHollandCode(studentData.hollandScores)
    }
    return null
  }, [studentData.hollandScores])

  const results = useMemo(() => {
    if (currentStep === 'results') {
      return calculateRecommendations({ ...studentData, hollandCode }, programs, {
        academicWeight: parseFloat(systemSettings.academic_weight) || 0.45,
        suastWeight: parseFloat(systemSettings.suast_weight) || 0.30,
        personalWeight: parseFloat(systemSettings.personal_weight) || 0.25,
        activePrograms,
      })
    }
    return null
  }, [currentStep, studentData, hollandCode, systemSettings, activePrograms])

  useEffect(() => {
    if (currentStep === 'results' && results && results.length > 0 && user) {
      fetch('/api/assessment/save', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strand: studentData.strand || '',
          gwa: studentData.gwa || 0,
          hollandCode: hollandCode?.code || '',
          topPrograms: results.slice(0, 5).map(r => r.program.code),
          fullData: {
            grades: studentData.grades || {},
            strandSpecificGrades: studentData.strandSpecificGrades || {},
            suastTiers: studentData.suastTiers || {},
            hollandCode: hollandCode || null,
            interests: studentData.interests || {},
            skills: studentData.skills || {},
            gwa: studentData.gwa || 0,
            strand: studentData.strand || '',
          },
        }),
      }).catch(err => console.error('Failed to save assessment results', err))
    }
  }, [currentStep === 'results'])

  const updateData = (updates) => {
    setStudentData(prev => ({ ...prev, ...updates }))
  }

  const handleStart = (school) => {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
    updateData({ name: fullName, school }); setStep(1)
  }
  const isStaff = ['admin', 'super_admin', 'department_head', 'counselor'].includes(user?.role)
  const handleGetStarted = () => {
    if (savedProgress && savedProgress.step > 0) {
      setShowResumePrompt(true)
    } else {
      setShowLanding(false); setShowProfile(false); setShowFAQ(false); setShowAdmin(false); setShowHistory(false); setShowPrograms(false); setShowSettings(false); setShowQuestions(false); setShowReview(false); setShowDashboard(false); setShowNotifications(false); setStep(0)
    }
  }
  const handleResume = () => {
    setStudentData(savedProgress.data)
    setStep(savedProgress.step)
    setShowLanding(false)
    setShowResumePrompt(false)
  }
  const handleNewAssessment = () => {
    setSavedProgress(null)
    setShowResumePrompt(false)
    setShowLanding(false); setShowProfile(false); setShowFAQ(false); setShowAdmin(false); setShowPrograms(false); setShowSettings(false); setShowQuestions(false); setShowReview(false); setShowDashboard(false); setShowNotifications(false); setStep(0)
    fetch('/api/assessment/progress', { method: 'DELETE', credentials: 'include' }).catch(err => console.error('Failed to delete saved progress on new assessment', err))
  }
  const handleShowProfile = () => { setShowProfile(true); setShowLanding(false); setShowFAQ(false); setShowAdmin(false); setShowHistory(false); setShowPrograms(false); setShowSettings(false); setShowQuestions(false); setShowReview(false); setShowDashboard(false); setShowNotifications(false) }
  const handleBackFromProfile = () => setShowProfile(false)
  const handleShowHistory = () => { setShowHistory(true); setShowLanding(false); setShowProfile(false); setShowFAQ(false); setShowAdmin(false); setShowPrograms(false); setShowSettings(false); setShowQuestions(false); setShowReview(false); setShowDashboard(false); setShowNotifications(false) }
  const handleBackFromHistory = () => setShowHistory(false)
  const handleShowFAQ = () => { setShowFAQ(true); setShowLanding(false); setShowProfile(false); setShowAdmin(false); setShowHistory(false); setShowPrograms(false); setShowSettings(false); setShowQuestions(false); setShowReview(false); setShowDashboard(false); setShowNotifications(false) }
  const handleBackFromFAQ = () => setShowFAQ(false)
  const handleShowAdmin = () => { setShowAdmin(true); setShowLanding(false); setShowProfile(false); setShowFAQ(false); setShowHistory(false); setShowPrograms(false); setShowSettings(false); setShowQuestions(false); setShowReview(false); setShowDashboard(false); setShowNotifications(false) }
  const handleBackFromAdmin = () => setShowAdmin(false)
  const handleShowPrograms = () => { setShowPrograms(true); setShowLanding(false); setShowProfile(false); setShowFAQ(false); setShowAdmin(false); setShowHistory(false); setShowSettings(false); setShowQuestions(false); setShowReview(false); setShowDashboard(false); setShowNotifications(false) }
  const handleShowSettings = () => { setShowSettings(true); setShowLanding(false); setShowProfile(false); setShowFAQ(false); setShowAdmin(false); setShowHistory(false); setShowPrograms(false); setShowQuestions(false); setShowReview(false); setShowDashboard(false); setShowNotifications(false) }
  const handleShowQuestions = () => { setShowQuestions(true); setShowLanding(false); setShowProfile(false); setShowFAQ(false); setShowAdmin(false); setShowHistory(false); setShowPrograms(false); setShowSettings(false); setShowReview(false); setShowDashboard(false); setShowNotifications(false) }
  const handleShowReview = () => { setShowReview(true); setShowLanding(false); setShowProfile(false); setShowFAQ(false); setShowAdmin(false); setShowHistory(false); setShowPrograms(false); setShowSettings(false); setShowQuestions(false); setShowDashboard(false); setShowNotifications(false) }
  const handleShowNotifications = () => { setShowNotifications(true); setShowLanding(false); setShowProfile(false); setShowFAQ(false); setShowAdmin(false); setShowHistory(false); setShowPrograms(false); setShowSettings(false); setShowQuestions(false); setShowReview(false); setShowDashboard(false) }
  const handleGoHome = () => {
    if (isStaff) {
      setShowLanding(true); setShowDashboard(false)
    } else {
      setShowDashboard(true); setShowLanding(false)
    }
    setShowProfile(false); setShowFAQ(false); setShowAdmin(false); setShowHistory(false); setShowPrograms(false); setShowSettings(false); setShowQuestions(false); setShowReview(false); setShowNotifications(false)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        color: '#94a3b8', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 15,
      }}>
        <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SkeletonLoader height={24} width="70%" style={{ margin: '0 auto' }} />
          <SkeletonLoader height={14} width="90%" />
          <SkeletonLoader height={14} width="80%" />
          <SkeletonLoader height={14} width="60%" />
        </div>
      </div>
    )
  }

  if (!user) return <AuthPage />

  if (!consented) return <ConsentPage onConsent={() => setConsented(true)} />

  // Email verification banner — only shown when email is unverified AND SMTP is configured
  const verificationBanner = smtpConfigured && !emailVerified ? (
    <div style={{
      background: 'rgba(234,179,8,0.1)', borderBottom: '1px solid rgba(234,179,8,0.2)',
      padding: '10px 20px', textAlign: 'center', fontSize: 13, color: '#fbbf24',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      Please verify your email address.{' '}
      <button
        onClick={async () => {
          try {
            setVerifMsg('Sending...')
            const res = await fetch('/api/resend-verification', { method: 'POST', credentials: 'include' })
            const data = await res.json()
            if (data.alreadyVerified) setEmailVerified(true)
            else setVerifMsg('Verification email sent! Check your inbox.')
            setTimeout(() => setVerifMsg(''), 5000)
          } catch {
            setVerifMsg('Failed to send verification email.')
            setTimeout(() => setVerifMsg(''), 5000)
          }
        }}
        style={{
          background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, textDecoration: 'underline',
        }}
      >
        Resend verification email
      </button>
      {verifMsg && <span style={{ marginLeft: 8, fontSize: 12, color: '#94a3b8' }}>{verifMsg}</span>}
    </div>
  ) : null

  let activePage = 'home'
  if (showNotifications) activePage = 'notifications'
  else if (showProfile) activePage = 'profile'
  else if (showHistory) activePage = 'history'
  else if (showPrograms) activePage = 'programs'
  else if (showSettings) activePage = 'settings'
  else if (showQuestions) activePage = 'questions'
  else if (showReview) activePage = 'review'
  else if (showFAQ) activePage = 'faq'
  else if (showAdmin) activePage = 'admin'
  else if (showDashboard) activePage = 'home'
  else if (!showLanding) activePage = 'assessment'

  const renderAssessmentProgress = () => {
    if (currentStep === 'results') return null
    const totalSteps = STEPS.length - 1
    const pct = Math.round((step / totalSteps) * 100)
    return (
      <div style={{ padding: '20px 0 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
            Step {step} of {totalSteps}
          </span>
          <span style={{ fontSize: 12, color: '#64748b' }}>{pct}% complete</span>
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {STEPS.slice(0, -1).map((s, i) => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              backgroundColor: i < step ? '#3b82f6' : i === step ? '#1e40af' : 'rgba(255,255,255,0.1)',
              transition: 'background-color 0.3s',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          {STEP_LABELS.slice(0, -1).map((l, i) => (
            <span key={l} style={{
              flex: 1, textAlign: 'center',
              color: i === step ? '#60a5fa' : i < step ? '#3b82f6' : '#64748b',
              fontWeight: i === step ? 700 : i < step ? 600 : 400,
            }}>
              {i === step ? `▸ ${l}` : l}
            </span>
          ))}
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome': return <Welcome onStart={handleStart} onBack={() => { setStep(null); handleGoHome() }} />
      case 'strand': return <StrandStep data={studentData} onUpdate={updateData} onNext={() => setStep(2)} onBack={() => setStep(0)} />
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

  if (showNotifications) {
    mainContent = <NotificationsPage />
  } else if (showProfile) {
    mainContent = <ProfilePage />
  } else if (showHistory) {
    mainContent = <HistoryPage />
  } else if (showPrograms) {
    mainContent = <ProgramsPage activePrograms={activePrograms} />
  } else if (showSettings) {
    mainContent = <SettingsPage settings={systemSettings} />
  } else if (showQuestions) {
    mainContent = (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)', padding: '24px 20px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px' }}>Questions</h1>
          <QuestionsManager />
        </div>
      </div>
    )
  } else if (showReview) {
    mainContent = (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)', padding: '24px 20px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px' }}>Review</h1>
          <CounselorDashboard />
        </div>
      </div>
    )
  } else if (showFAQ) {
    mainContent = <FAQPage />
  } else if (showAdmin) {
    mainContent = <AdminPage userRole={user?.role} />
  } else if (showDashboard) {
    mainContent = <UserDashboard onStartAssessment={handleGetStarted} onViewHistory={handleShowHistory} />
  } else if (showLanding) {
    mainContent = <LandingPage onGetStarted={handleGetStarted} user={user} />
  } else {
    mainContent = (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          {renderAssessmentProgress()}
          <div className="card-padding-mobile" style={{
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
                  setSavedProgress(null)
                  setShowLanding(true)
                  fetch('/api/assessment/progress', { method: 'DELETE', credentials: 'include' }).catch(err => console.error('Failed to delete saved progress on restart', err))
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
      {showResumePrompt && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            backgroundColor: '#1e293b', borderRadius: 20, padding: 32, maxWidth: 400, width: '100%',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}>
            <h3 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
              Resume where you left off?
            </h3>
            <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 20px', lineHeight: 1.5 }}>
              You have an incomplete assessment from your last session. Would you like to continue where you stopped?
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={handleNewAssessment} style={{
                padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'transparent', color: '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Start Over
              </button>
              <button onClick={handleResume} style={{
                padding: '10px 20px', borderRadius: 10, border: 'none',
                backgroundColor: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                Resume
              </button>
            </div>
          </div>
        </div>
      )}
      {verificationBanner}
      <Sidebar
        user={user}
        activePage={activePage}
        onHome={handleGoHome}
        onAssessment={handleGetStarted}
        onProfile={handleShowProfile}
        onHistory={handleShowHistory}
        onNotifications={handleShowNotifications}
        onPrograms={handleShowPrograms}
        onSettings={handleShowSettings}
        onQuestions={handleShowQuestions}
        onReview={handleShowReview}
        onFAQ={handleShowFAQ}
        onAdmin={handleShowAdmin}
        onLogout={logout}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
      />
      <div style={{ flex: 1, marginLeft: !isMobile && sidebarOpen ? 220 : 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', transition: 'margin-left 0.3s ease', minWidth: 0 }}>
        {mainContent}
      </div>
      <ChatWidget />
      {!['admin', 'super_admin', 'department_head', 'counselor'].includes(user?.role) && showLanding && <OnboardingWalkthrough />}
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
