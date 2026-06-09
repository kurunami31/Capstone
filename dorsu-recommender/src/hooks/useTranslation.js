import { useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'

import en from '../i18n/en.json'
import tl from '../i18n/tl.json'
import ceb from '../i18n/ceb.json'

const TRANSLATIONS = { en, tl, ceb }

export function useTranslation() {
  const { locale } = useLanguage()

  const t = useMemo(() => {
    const strings = TRANSLATIONS[locale] || TRANSLATIONS.en

    return (key, params = {}) => {
      let val = strings[key]
      if (val == null) {
        val = TRANSLATIONS.en[key]
      }
      if (val == null) return key

      if (Object.keys(params).length) {
        Object.entries(params).forEach(([k, v]) => {
          val = val.replace(`{${k}}`, v)
        })
      }
      return val
    }
  }, [locale])

  return { t, locale }
}
