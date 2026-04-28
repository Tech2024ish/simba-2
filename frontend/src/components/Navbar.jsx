import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Home, ShoppingBag, LayoutDashboard, LogOut, Search, Info, Phone, Star } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import DarkModeToggle from './DarkModeToggle.jsx'
import CartDrawer from './CartDrawer.jsx'
import { useToast } from './Toast.jsx'

export default function Navbar() {
  const { count, cartBounce } = useCart()
  const { user, profile, logout } = useAuth()
  const { t } = useLang()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const searchTimeout = useRef(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleSearch = (e) => {
    const val = e.target.value
    setSearch(val)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      if (val.trim()) {
        navigate(`/shop?search=${encodeURIComponent(val.trim())}`)
      }
    }, 400)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/shop?search=${encodeURIComponent(search.trim())}`)
  }

  const handleLogout = async () => {
    try {
      await logout()
      setUserMenuOpen(false)
      setMobileOpen(false)
      addToast('Logged out successfully.', 'success')
      navigate('/')
    } catch {
      addToast('We could not log you out right now. Please try again.', 'error')
    }
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled ? 'glass shadow-sm' : 'bg-white dark:bg-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl">🦁</span>
              <span className="font-heading font-bold text-xl text-simba-red tracking-tight">Simba</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { to: '/',        label: t('nav_home'),     icon: Home },
                { to: '/shop',    label: t('nav_shop'),     icon: ShoppingBag },
                { to: '/about',   label: t('nav_about'),    icon: Info },
                { to: '/reviews', label: t('nav_reviews'),  icon: Star },
                { to: '/contact', label: t('nav_contact'),  icon: Phone },
              ].map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${location.pathname === to ? 'text-simba-red bg-red-50 dark:bg-red-900/20' : 'text-gray-600 dark:text-gray-300 hover:text-simba-red hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </Link>
              ))}
            </div>

            {/* Search bar — desktop */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder={t('nav_search')}
                  className="w-full pl-9 pr-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 transition-all"
                />
              </div>
            </form>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />
              <DarkModeToggle />

              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={t('nav_cart')}
              >
                <ShoppingCart className={`w-5 h-5 ${cartBounce ? 'animate-bounce-once text-simba-red' : 'text-gray-600 dark:text-gray-300'}`} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-simba-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-simba-red flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                      {profile?.full_name?.split(' ')[0] || 'Account'}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                      {profile?.role === 'market_rep' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <LayoutDashboard className="w-4 h-4" />
                          {t('nav_dashboard')}
                        </Link>
                      )}
                      <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-simba-red hover:bg-gray-50 dark:hover:bg-gray-700">
                        <LogOut className="w-4 h-4" />
                        {t('nav_logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-simba-red transition-colors px-3 py-2">
                    {t('nav_login')}
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">
                    {t('nav_register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: cart + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2"
                aria-label={t('nav_cart')}
              >
                <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-simba-red text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder={t('nav_search')}
                  className="w-full pl-9 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-2">
            {[
              { to: '/',        label: t('nav_home'),    Icon: Home },
              { to: '/shop',    label: t('nav_shop'),    Icon: ShoppingBag },
              { to: '/about',   label: t('nav_about'),   Icon: Info },
              { to: '/reviews', label: t('nav_reviews'), Icon: Star },
              { to: '/contact', label: t('nav_contact'), Icon: Phone },
            ].map(({ to, label, Icon }) => (
              <Link key={to} to={to} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium">
                <Icon className="w-5 h-5 text-simba-red" />{label}
              </Link>
            ))}
            {profile?.role === 'market_rep' && (
              <Link to="/admin" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium">
                <LayoutDashboard className="w-5 h-5 text-simba-red" />{t('nav_dashboard')}
              </Link>
            )}
            <div className="flex items-center gap-3 px-3 py-2">
              <LanguageSwitcher />
              <DarkModeToggle />
            </div>
            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 rounded-xl text-simba-red hover:bg-red-50 dark:hover:bg-red-900/20 font-medium w-full">
                <LogOut className="w-5 h-5" />{t('nav_logout')}
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1 text-center border border-simba-red text-simba-red rounded-full py-2.5 font-semibold text-sm">{t('nav_login')}</Link>
                <Link to="/register" className="flex-1 text-center bg-simba-red text-white rounded-full py-2.5 font-semibold text-sm">{t('nav_register')}</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-2 py-2 flex items-center justify-around">
        <Link to="/" className="flex flex-col items-center gap-0.5 px-3 py-1">
          <Home className={`w-5 h-5 ${location.pathname === '/' ? 'text-simba-red' : 'text-gray-400'}`} />
          <span className={`text-xs ${location.pathname === '/' ? 'text-simba-red font-semibold' : 'text-gray-400'}`}>{t('nav_home')}</span>
        </Link>
        <Link to="/shop" className="flex flex-col items-center gap-0.5 px-3 py-1">
          <ShoppingBag className={`w-5 h-5 ${location.pathname === '/shop' ? 'text-simba-red' : 'text-gray-400'}`} />
          <span className={`text-xs ${location.pathname === '/shop' ? 'text-simba-red font-semibold' : 'text-gray-400'}`}>{t('nav_shop')}</span>
        </Link>
        <button onClick={() => setCartOpen(true)} className="flex flex-col items-center gap-0.5 px-3 py-1 relative">
          <ShoppingCart className="w-5 h-5 text-gray-400" />
          {count > 0 && <span className="absolute top-0 right-2 bg-simba-red text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">{count}</span>}
          <span className="text-xs text-gray-400">{t('nav_cart')}</span>
        </button>
        <Link to={user ? (profile?.role === 'market_rep' ? '/admin' : '/shop') : '/login'} className="flex flex-col items-center gap-0.5 px-3 py-1">
          <User className={`w-5 h-5 ${(location.pathname === '/login' || location.pathname === '/admin') ? 'text-simba-red' : 'text-gray-400'}`} />
          <span className={`text-xs ${(location.pathname === '/login' || location.pathname === '/admin') ? 'text-simba-red font-semibold' : 'text-gray-400'}`}>
            {user ? (profile?.role === 'market_rep' ? t('nav_dashboard') : t('profile')) : t('nav_login')}
          </span>
        </Link>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
