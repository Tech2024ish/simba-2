import { useLang } from '../context/LangContext.jsx'

const LANGS = [
  { code: 'en', label: 'EN', flag: '🇬🇧', full: 'English' },
  { code: 'fr', label: 'FR', flag: '🇫🇷', full: 'Français' },
  { code: 'rw', label: 'RW', flag: '🇷🇼', full: 'Kinyarwanda' },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-full p-0.5">
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          title={l.full}
          aria-label={`Switch to ${l.full}`}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
            lang === l.code
              ? 'bg-simba-red text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <span>{l.flag}</span>
          <span>{l.label}</span>
        </button>
      ))}
    </div>
  )
}
