import { createContext, useContext, useState, useCallback } from 'react'
import { translations, defaultLang } from '../i18n/index.js'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('simba_lang') || defaultLang
  })

  const setLang = useCallback((l) => {
    localStorage.setItem('simba_lang', l)
    setLangState(l)
  }, [])

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations[defaultLang]?.[key] || key
  }, [lang])

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
