import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext.jsx'

export default function NotFound() {
  const { t } = useLang()
  return (
    <div className="page-enter min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-28 text-center">
      <span className="text-8xl mb-6">🦁</span>
      <h1 className="font-heading font-bold text-6xl text-simba-red mb-2">404</h1>
      <p className="font-heading font-bold text-2xl text-gray-800 dark:text-gray-200 mb-3">Page not found</p>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/" className="btn-primary">Go Home</Link>
        <Link to="/shop" className="btn-outline">{t('nav_shop')}</Link>
      </div>
    </div>
  )
}
