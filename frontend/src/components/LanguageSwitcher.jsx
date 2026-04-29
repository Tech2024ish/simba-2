import { useLang } from '../context/LangContext.jsx'

const LANGS = [
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'rw', flag: '🇷🇼', label: 'RW' },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-full p-1" role="group" aria-label="Select language">
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          title={l.code === 'en' ? 'English' : l.code === 'fr' ? 'Français' : 'Kinyarwanda'}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
            lang === l.code
              ? 'bg-simba-red text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <span>{l.flag}</span>
          <span>{l.label}</span>
        </button>
      ))}
    </div>
  )
}
