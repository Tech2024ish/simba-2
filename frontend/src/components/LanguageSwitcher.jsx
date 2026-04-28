import { useLang } from '../context/LangContext.jsx'

const LANGS = [
  { code: 'en', flag: '🇬🇧', full: 'English' },
  { code: 'fr', flag: '🇫🇷', full: 'Français' },
  { code: 'rw', flag: '🇷🇼', full: 'Kinyarwanda' },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const current = LANGS.find(l => l.code === lang) || LANGS[0]

  return (
    <div className="relative">
      <select
        value={lang}
        onChange={e => setLang(e.target.value)}
        aria-label="Select language"
        className="appearance-none pl-7 pr-6 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-transparent hover:border-simba-red focus:border-simba-red focus:outline-none cursor-pointer transition-colors"
      >
        {LANGS.map(l => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.full}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm leading-none">
        {current.flag}
      </span>
      <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
