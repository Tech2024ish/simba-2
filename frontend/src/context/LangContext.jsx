import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { translations, defaultLang } from '../i18n/index.js'

const VALID_LANGS = ['en', 'fr', 'rw']
const LangContext = createContext(null)

export function LangProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  const [lang, setLangState] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get('lang')
    if (urlLang && VALID_LANGS.includes(urlLang)) {
      localStorage.setItem('simba_lang', urlLang)
      document.documentElement.lang = urlLang
      return urlLang
    }
    const saved = localStorage.getItem('simba_lang') || defaultLang
    document.documentElement.lang = saved
    return saved
  })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlLang = params.get('lang')
    if (urlLang && VALID_LANGS.includes(urlLang) && urlLang !== lang) {
      localStorage.setItem('simba_lang', urlLang)
      document.documentElement.lang = urlLang
      setLangState(urlLang)
    }
  }, [location.search, lang])

  const setLang = useCallback((l) => {
    if (!VALID_LANGS.includes(l)) return
    localStorage.setItem('simba_lang', l)
    document.documentElement.lang = l
    setLangState(l)
    const params = new URLSearchParams(location.search)
    params.set('lang', l)
    navigate({ search: params.toString() }, { replace: true })
  }, [location.search, navigate])

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
