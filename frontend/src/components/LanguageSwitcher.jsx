import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'

const LANGS = [
  { code: 'en', flag: '🇬🇧', label: 'EN', full: 'English' },
  { code: 'fr', flag: '🇫🇷', label: 'FR', full: 'Français' },
  { code: 'rw', flag: '🇷🇼', label: 'RW', full: 'Kinyarwanda' },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const hrefFor = (code) => {
    const params = new URLSearchParams(location.search)
    params.set('lang', code)
    return `${location.pathname}?${params.toString()}`
  }

  const current = LANGS.find(l => l.code === lang) || LANGS[0]

  const select = (code) => {
    setLang(code)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50"
        >
          {LANGS.map(l => (
            <li key={l.code} role="option" aria-selected={lang === l.code}>
              <a
                href={hrefFor(l.code)}
                title={l.full}
                onClick={(e) => { e.preventDefault(); select(l.code) }}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold no-underline transition-colors ${
                  lang === l.code
                    ? 'bg-simba-red text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.full}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
