import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'

export default function DarkModeToggle() {
  const { t } = useLang()
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('simba_dark') === 'true' ||
      (!localStorage.getItem('simba_dark') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('simba_dark', dark)
  }, [dark])

  return (
    <button
      onClick={() => setDark(d => !d)}
      title={dark ? t('light_mode') : t('dark_mode')}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={dark ? t('light_mode') : t('dark_mode')}
    >
      {dark ? <Sun className="w-5 h-5 text-simba-orange" /> : <Moon className="w-5 h-5 text-gray-600" />}
    </button>
  )
}
