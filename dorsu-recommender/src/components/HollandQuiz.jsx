import { useState } from 'react'
import hollandQuestions from '../data/holland.json'

const scaleLabels = ['Strongly<br/>Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly<br/>Agree']

export default function HollandQuiz({ data, onUpdate, onNext, onBack }) {
  const [answers, setAnswers] = useState(data.hollandAnswers || {})
  const [step, setStep] = useState(0)

  const currentDim = hollandQuestions[step]
  const totalSteps = hollandQuestions.length

  const setAnswer = (qIdx, val) => {
    const key = `${currentDim.dimension}_${qIdx}`
    setAnswers(a => ({ ...a, [key]: val }))
  }

  const isStepComplete = () => {
    for (let i = 0; i < currentDim.questions.length; i++) {
      if (!answers[`${currentDim.dimension}_${i}`]) return false
    }
    return true
  }

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(s => s + 1)
  }

  const handlePrev = () => {
    if (step > 0) setStep(s => s - 1)
  }

  const handleFinish = () => {
    const dimScores = {}
    for (const dim of hollandQuestions) {
      let sum = 0
      for (let i = 0; i < dim.questions.length; i++) {
        sum += Number(answers[`${dim.dimension}_${i}`] || 3)
      }
      dimScores[dim.dimension] = Math.round((sum / dim.questions.length) * 20)
    }
    onUpdate({ hollandAnswers: answers, hollandScores: dimScores })
    onNext()
  }

  const allAnswered = () => {
    for (const dim of hollandQuestions) {
      for (let i = 0; i < dim.questions.length; i++) {
        if (!answers[`${dim.dimension}_${i}`]) return false
      }
    }
    return true
  }

  const dotStyle = (active) => ({
    width: 10, height: 10, borderRadius: '50%',
    backgroundColor: active ? '#1a56db' : '#ddd', border: 'none'
  })

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Career Personality Assessment</h2>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Rate how much each statement describes you. There are no right or wrong answers.
      </p>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
        {hollandQuestions.map((_, i) => (
          <div key={i} style={dotStyle(i <= step)} />
        ))}
      </div>

      <div style={{
        padding: 24, backgroundColor: '#f8f9ff', borderRadius: 12,
        border: '1px solid #e0e4f0', marginBottom: 20
      }}>
        <div style={{ fontSize: 14, color: '#888', marginBottom: 8, fontWeight: 600 }}>
          {currentDim.dimension} — Set {step + 1} of {totalSteps}
        </div>

        {currentDim.questions.map((q, qi) => (
          <div key={qi} style={{ marginBottom: qi < currentDim.questions.length - 1 ? 16 : 0 }}>
            <p style={{ fontWeight: 500, marginBottom: 8, fontSize: 15 }}>{q}</p>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => setAnswer(qi, val)}
                  style={{
                    width: 52, height: 40, fontSize: 14, fontWeight: 600,
                    border: `2px solid ${answers[`${currentDim.dimension}_${qi}`] === val ? '#1a56db' : '#ddd'}`,
                    backgroundColor: answers[`${currentDim.dimension}_${qi}`] === val ? '#eef4ff' : '#fff',
                    borderRadius: 6, cursor: 'pointer'
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginTop: 2 }}>
              <span>Disagree</span>
              <span>Agree</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <button onClick={step > 0 ? handlePrev : onBack} style={secondaryBtn}>
          {step > 0 ? 'Previous' : 'Back'}
        </button>

        {step < totalSteps - 1 ? (
          <button onClick={handleNext} disabled={!isStepComplete()} style={btnStyle(isStepComplete())}>
            Next Set
          </button>
        ) : (
          <button onClick={handleFinish} disabled={!allAnswered()} style={btnStyle(allAnswered())}>
            Finish Assessment
          </button>
        )}
      </div>
    </div>
  )
}

function btnStyle(ready) {
  return {
    padding: '12px 40px', fontSize: 15, fontWeight: 600,
    backgroundColor: ready ? '#1a56db' : '#aaa', color: '#fff',
    border: 'none', borderRadius: 8, cursor: ready ? 'pointer' : 'not-allowed'
  }
}

const secondaryBtn = {
  padding: '12px 40px', fontSize: 15, fontWeight: 600,
  backgroundColor: '#fff', color: '#333', border: '1px solid #ccc', borderRadius: 8, cursor: 'pointer'
}
