import { useState, useMemo } from 'react'
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
  'welcome', 'strand', 'grades', 'suast', 'holland', 'interest', 'skills', 'results'
]

const STEP_LABELS = [
  'Welcome', 'SHS Strand', 'Grades', 'SUAST Exam',
  'Personality', 'Interests', 'Skills', 'Results'
]

export default function App() {
  const [step, setStep] = useState(0)
  const [studentData, setStudentData] = useState({
    name: '',
    school: '',
    strand: '',
    grades: {},
    strandSpecificGrades: {},
    gwa: 0,
    suastTiers: {},
    hollandAnswers: {},
    hollandScores: [],
    interests: {},
    skills: {},
  })

  const updateData = (updates) => {
    setStudentData(prev => ({ ...prev, ...updates }))
  }

  const handleStart = (name, school) => {
    updateData({ name, school })
    setStep(1)
  }

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
  }, [currentStep === 'results'])

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <Welcome onStart={handleStart} />
      case 'strand':
        return (
          <StrandStep
            data={studentData}
            onUpdate={updateData}
            onNext={() => setStep(2)}
          />
        )
      case 'grades':
        return (
          <GradesStep
            data={studentData}
            onUpdate={updateData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )
      case 'suast':
        return (
          <SUASTStep
            data={studentData}
            onUpdate={updateData}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )
      case 'holland':
        return (
          <HollandQuiz
            data={studentData}
            onUpdate={updateData}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        )
      case 'interest':
        return (
          <InterestStep
            data={studentData}
            onUpdate={updateData}
            onNext={() => setStep(6)}
            onBack={() => setStep(4)}
          />
        )
      case 'skills':
        return (
          <SkillsStep
            data={studentData}
            onUpdate={updateData}
            onNext={() => setStep(7)}
            onBack={() => setStep(5)}
          />
        )
      case 'results':
        return (
          <Results
            studentData={studentData}
            results={results}
            onRestart={() => {
              setStudentData({
                name: '', school: '', strand: '', grades: {},
                strandSpecificGrades: {}, gwa: 0, suastTiers: {},
                hollandAnswers: {}, hollandScores: [],
                interests: {}, skills: {},
              })
              setStep(0)
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <div style={{
        maxWidth: 800, margin: '0 auto', padding: '0 16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {currentStep !== 'welcome' && currentStep !== 'results' && (
          <div style={{ padding: '20px 0 12px' }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
              {STEPS.slice(1, -1).map((s, i) => (
                <div
                  key={s}
                  style={{
                    flex: 1, height: 4, borderRadius: 2,
                    backgroundColor: i < step - 1 ? '#1a56db' : i === step - 1 ? '#93c5fd' : '#e0e0e0',
                    transition: 'background-color 0.3s'
                  }}
                />
              ))}
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888'
            }}>
              {STEP_LABELS.slice(1, -1).map((l, i) => (
                <span key={l} style={{ fontWeight: i <= step - 1 ? 600 : 400 }}>{l}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{
          backgroundColor: '#fff', borderRadius: 12, padding: 32,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginTop: currentStep === 'welcome' ? 60 : 16,
          marginBottom: 40
        }}>
          {renderStep()}
        </div>
      </div>
    </div>
  )
}
