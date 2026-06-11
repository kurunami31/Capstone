import { useState, useEffect } from 'react'
import { Joyride, EVENTS } from 'react-joyride'
import { useTranslation } from '../hooks/useTranslation.js'

const STORAGE_KEY = 'dorsu_onboarding_v2'
const APP_VERSION = '2.1.0'

export default function OnboardingWalkthrough({ isStaff = false, isLanding = false }) {
  const { t } = useTranslation()
  const [run, setRun] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored || stored !== APP_VERSION) {
      const timeout = setTimeout(() => setRun(true), 600)
      return () => clearTimeout(timeout)
    }
  }, [])

  const done = () => {
    localStorage.setItem(STORAGE_KEY, APP_VERSION)
    setRun(false)
  }

  const landingStudentSteps = [
    {
      target: 'body',
      placement: 'center',
      title: t('tour.welcome'),
      content: t('tour.welcomeDesc'),
      disableBeacon: true,
    },
    {
      target: '.hero-cta',
      title: t('tour.start'),
      content: t('tour.startDesc'),
      disableBeacon: true,
    },
    {
      target: '.step-card',
      title: t('tour.how'),
      content: t('tour.howDesc'),
      disableBeacon: true,
    },
    {
      target: 'body',
      placement: 'center',
      title: t('tour.done'),
      content: t('tour.doneDesc'),
      disableBeacon: true,
    },
  ]

  const dashboardStudentSteps = [
    {
      target: 'body',
      placement: 'center',
      title: t('tour.welcome'),
      content: t('tour.welcomeDesc'),
      disableBeacon: true,
    },
    {
      target: '.dashboard-start-btn',
      title: t('tour.start'),
      content: t('tour.startDesc'),
      disableBeacon: true,
    },
    {
      target: '.dashboard-profile-card',
      title: t('tour.how'),
      content: t('tour.howDesc'),
      disableBeacon: true,
    },
    {
      target: 'body',
      placement: 'center',
      title: t('tour.done'),
      content: t('tour.doneDesc'),
      disableBeacon: true,
    },
  ]

  const studentSteps = isLanding ? landingStudentSteps : dashboardStudentSteps

  const staffSteps = [
    {
      target: 'body',
      placement: 'center',
      title: t('tour.adminWelcome'),
      content: t('tour.adminWelcomeDesc'),
      disableBeacon: true,
    },
    {
      target: 'body',
      placement: 'center',
      title: t('tour.sidebar'),
      content: t('tour.sidebarDesc'),
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
      options={{
        buttons: ['back', 'close', 'primary', 'skip'],
      }}
      styles={{
        options: {
          primaryColor: '#3b82f6',
          textColor: '#e2e8f0',
          backgroundColor: '#1e293b',
          arrowColor: '#64748b',
          overlayColor: 'rgba(0,0,0,0.75)',
          zIndex: 10000,
          width: 400,
        },
        tooltip: {
          backgroundColor: '#1e293b',
          color: '#e2e8f0',
          borderRadius: 16,
          padding: 24,
          fontSize: 15,
          lineHeight: 1.6,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        },
        tooltipContainer: {
          textAlign: 'left',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#e2e8f0',
        },
        tooltipContent: {
          color: '#cbd5e1',
          fontSize: 14,
          lineHeight: 1.6,
          paddingTop: 12,
          paddingBottom: 16,
        },
        tooltipTitle: {
          color: '#f8fafc',
          fontSize: 20,
          fontWeight: 700,
          margin: 0,
          paddingBottom: 4,
        },
        buttonPrimary: {
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: 14,
          borderRadius: 8,
          border: 'none',
          padding: '8px 18px',
          cursor: 'pointer',
        },
        buttonBack: {
          color: '#94a3b8',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
        },
        buttonSkip: {
          color: '#64748b',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
        },
        buttonClose: {
          color: '#64748b',
        },
        overlay: {
          backgroundColor: 'rgba(0,0,0,0.75)',
        },
        floater: {
          filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.4))',
        },
      }}
      locale={{
        back: t('onboarding.back'),
        close: 'Close',
        last: t('onboarding.gotIt'),
        next: t('onboarding.next'),
        skip: t('onboarding.skip'),
      }}
      onEvent={(data) => {
        if (data.type === EVENTS.TOUR_END) {
          done()
        }
      }}
    />
  )
}
