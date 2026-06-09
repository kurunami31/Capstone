import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

const SUPPORTED_LOCALES = ['en', 'tl', 'ceb']
const DEFAULT_LOCALE = 'en'
const STORAGE_KEY = 'dorsu-locale'

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && SUPPORTED_LOCALES.includes(stored)) return stored
    } catch { }
    return DEFAULT_LOCALE
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, locale) } catch { }
  }, [locale])

  const changeLocale = (l) => {
    if (SUPPORTED_LOCALES.includes(l)) setLocale(l)
  }

  return (
    <LanguageContext.Provider value={{ locale, changeLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
