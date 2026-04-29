import { useLocation } from 'react-router-dom'
import { useLang } from '../context/LangContext.jsx'

const LANGS = [
  { code: 'en', flag: '🇬🇧', label: 'EN', full: 'English' },
  { code: 'fr', flag: '🇫🇷', label: 'FR', full: 'Français' },
  { code: 'rw', flag: '🇷🇼', label: 'RW', full: 'Kinyarwanda' },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const location = useLocation()

  const hrefFor = (code) => {
    const params = new URLSearchParams(location.search)
    params.set('lang', code)
    return `${location.pathname}?${params.toString()}`
  }

  return (
    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-full p-1" role="group" aria-label="Select language">
      {LANGS.map(l => (
        <a
          key={l.code}
          href={hrefFor(l.code)}
          title={l.full}
          onClick={(e) => { e.preventDefault(); setLang(l.code) }}
          aria-current={lang === l.code ? 'true' : undefined}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all no-underline ${
            lang === l.code
              ? 'bg-simba-red text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <span>{l.flag}</span>
          <span>{l.label}</span>
        </a>
      ))}
    </div>
  )
}
