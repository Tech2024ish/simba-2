import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { useToast } from '../components/Toast.jsx'

export default function Login() {
  const { login } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const next = searchParams.get('next') || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await login(form.email, form.password)
      addToast(`Welcome back!`, 'success')
      navigate(next)
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter min-h-screen flex items-center justify-center px-4 pt-20 pb-28 md:pb-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🦁</span>
            <span className="font-heading font-bold text-2xl text-simba-red">Simba</span>
          </Link>
          <h1 className="font-heading font-bold text-3xl text-gray-900 dark:text-white">{t('login_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{t('login_sub')}</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-simba-red rounded-xl px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('email_label')}</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200 transition-all"
                placeholder="buyer@test.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('password_label')}</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><LogIn className="w-5 h-5" /> {t('login_btn')}</>
              )}
            </button>
          </form>

          {/* Test credentials hint */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Test accounts:</p>
            <p className="text-xs text-blue-500 dark:text-blue-400">Buyer: buyer@test.com / password123</p>
            <p className="text-xs text-blue-500 dark:text-blue-400">Admin: admin@test.com / admin123</p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          {t('no_account')}{' '}
          <Link to="/register" className="text-simba-red font-semibold hover:underline">{t('nav_register')}</Link>
        </p>
      </div>
    </div>
  )
}
