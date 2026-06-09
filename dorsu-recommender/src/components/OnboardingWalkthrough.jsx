import { useState, useEffect } from 'react'
import { Joyride } from 'react-joyride'

const STORAGE_KEY = 'dorsu_onboarding_v2'

export default function OnboardingWalkthrough({ isStaff = false, isLanding = false }) {
  const [run, setRun] = useState(false)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) {
      const t = setTimeout(() => setRun(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  const done = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setRun(false)
  }

  const landingStudentSteps = [
    {
      target: 'body',
      placement: 'center',
      title: 'Welcome to DOrSU Recommender!',
      content: 'This system helps you find the best college programs at Davao Oriental State University based on your unique strengths, grades, and interests.',
      disableBeacon: true,
    },
    {
      target: '.hero-cta',
      title: 'Start Your Assessment',
      content: 'Click the "Get Started" button to begin your 7-step assessment. It takes about 15\u201320 minutes to complete.',
      disableBeacon: true,
    },
    {
      target: '.step-card',
      title: 'How the Assessment Works',
      content: 'The assessment covers your SHS strand, grades, aptitude exam (SUAST), personality type, career interests, and skills. Each step builds a complete picture of you.',
      disableBeacon: true,
    },
    {
      target: 'body',
      placement: 'center',
      title: "You're All Set!",
      content: 'After the assessment, you will get a ranked list of recommended programs. Use the sidebar to browse programs, explore careers, and view your history anytime.',
      disableBeacon: true,
    },
  ]

  const dashboardStudentSteps = [
    {
      target: 'body',
      placement: 'center',
      title: 'Welcome to DOrSU Recommender!',
      content: 'This system helps you find the best college programs at Davao Oriental State University based on your unique strengths, grades, and interests.',
      disableBeacon: true,
    },
    {
      target: '.dashboard-start-btn',
      title: 'Start Your Assessment',
      content: 'Click the "Start Assessment" button to begin your 7-step assessment. It takes about 15\u201320 minutes to complete.',
      disableBeacon: true,
    },
    {
      target: '.dashboard-profile-card',
      title: 'How the Assessment Works',
      content: 'The assessment covers your SHS strand, grades, aptitude exam (SUAST), personality type, career interests, and skills. Each step builds a complete picture of you. Your dashboard will track your progress and results.',
      disableBeacon: true,
    },
    {
      target: 'body',
      placement: 'center',
      title: "You're All Set!",
      content: 'After the assessment, you will get a ranked list of recommended programs. Use the sidebar to browse programs, explore careers, and view your history anytime.',
      disableBeacon: true,
    },
  ]

  const studentSteps = isLanding ? landingStudentSteps : dashboardStudentSteps

  const staffSteps = [
    {
      target: 'body',
      placement: 'center',
      title: 'Welcome to the Admin Panel!',
      content: 'You have access to manage programs, review student assessments, configure system settings, and view analytics.',
      disableBeacon: true,
    },
    {
      target: 'body',
      placement: 'center',
      title: 'Sidebar Navigation',
      content: 'Use the sidebar to manage programs, customize assessment questions, review student assessments, and access the admin dashboard for user management and analytics.',
      disableBeacon: true,
    },
  ]

  const steps = isStaff ? staffSteps : studentSteps

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose
      spotlightClicks
      styles={{
        options: {
          primaryColor: '#2563eb',
          textColor: '#e2e8f0',
          backgroundColor: '#1e293b',
          arrowColor: '#1e293b',
          overlayColor: 'rgba(0,0,0,0.6)',
        },
        tooltipContainer: {
          textAlign: 'left',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        buttonNext: {
          backgroundColor: '#2563eb',
          color: '#fff',
          fontWeight: 600,
          fontSize: 13,
          borderRadius: 8,
        },
        buttonBack: {
          color: '#94a3b8',
          fontWeight: 600,
          fontSize: 13,
        },
        buttonSkip: {
          color: '#64748b',
          fontWeight: 600,
          fontSize: 13,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Got it!',
        next: 'Next',
        skip: 'Skip Tour',
      }}
      callback={(data) => {
        if (data.status === 'finished' || data.status === 'skipped') {
          done()
        }
      }}
    />
  )
}
