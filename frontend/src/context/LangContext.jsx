import { createContext, useContext, useState, useCallback } from 'react'
import { translations, defaultLang } from '../i18n/index.js'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('simba_lang') || defaultLang
    document.documentElement.lang = saved
    return saved
  })

  const setLang = useCallback((l) => {
    localStorage.setItem('simba_lang', l)
    document.documentElement.lang = l
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
