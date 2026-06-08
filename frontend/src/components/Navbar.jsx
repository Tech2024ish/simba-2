import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Home, ShoppingBag, LayoutDashboard, LogOut, Search, Info, Phone } from 'lucide-react'
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
      addToast(t('logout_success'), 'success')
      navigate('/')
    } catch {
      addToast(t('logout_error'), 'error')
    }
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-30 bg-[#F2701B] transition-shadow duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center text-xl sm:text-2xl shadow-sm">🦁</div>
              <div className="leading-tight hidden sm:block">
                <div className="font-heading font-bold text-base sm:text-lg text-white tracking-tight">Simba Supermarket</div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/80">Online Shopping</div>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              {[
                { to: '/',        label: t('nav_home') },
                { to: '/shop',    label: t('nav_shop') },
                { to: '/about',   label: t('nav_about') },
                { to: '/contact', label: t('nav_contact') },
              ].map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${location.pathname === to ? 'bg-white/20 text-white' : 'text-white/85 hover:text-white hover:bg-white/10'}`}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Search bar — desktop, attached button */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder={t('nav_search')}
                  className="w-full pl-4 pr-4 py-2.5 rounded-l-full bg-white border border-transparent focus:outline-none text-sm text-gray-800 placeholder-gray-400 transition-all"
                />
              </div>
              <button type="submit" aria-label={t('nav_search')}
                className="px-4 rounded-r-full bg-simba-navy text-white hover:bg-[#16283f] transition-colors flex items-center justify-center">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <LanguageSwitcher />
              <DarkModeToggle />

              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full bg-simba-navy text-white text-sm font-semibold hover:bg-[#16283f] transition-colors"
                aria-label={t('nav_cart')}
              >
                {t('nav_cart')}
                <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/15">
                  <ShoppingCart className={`w-4 h-4 ${cartBounce ? 'animate-bounce-once' : ''}`} />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-white text-simba-navy text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </span>
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                      <User className="w-4 h-4 text-[#F2701B]" />
                    </div>
                    <span className="text-sm font-medium text-white max-w-[100px] truncate">
                      {profile?.full_name?.split(' ')[0] || t('account_label')}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <User className="w-4 h-4" /> {t('my_profile')}
                      </Link>
                      <Link to="/my-orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <ShoppingBag className="w-4 h-4" /> {t('my_orders_title')}
                      </Link>
                      {(profile?.role === 'admin' || profile?.role === 'branch_manager') && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <LayoutDashboard className="w-4 h-4" /> {t('nav_dashboard')}
                        </Link>
                      )}
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                      <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-simba-red hover:bg-gray-50 dark:hover:bg-gray-700">
                        <LogOut className="w-4 h-4" /> {t('nav_logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Link to="/login" className="text-sm font-semibold text-white/90 hover:text-white transition-colors px-3 py-2">
                    {t('nav_login')}
                  </Link>
                  <Link to="/register" className="bg-white text-[#F2701B] text-sm font-semibold py-2 px-4 rounded-full hover:bg-white/90 transition-colors">
                    {t('nav_register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: cart + hamburger */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2"
                aria-label={t('nav_cart')}
              >
                <ShoppingCart className="w-5 h-5 text-white" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-simba-navy text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="p-2 rounded-full hover:bg-white/10"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="md:hidden pb-3 flex">
            <form onSubmit={handleSearchSubmit} className="flex flex-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder={t('nav_search')}
                  className="w-full pl-4 pr-4 py-2 rounded-l-full bg-white border border-transparent focus:outline-none text-sm text-gray-800 placeholder-gray-400"
                />
              </div>
              <button type="submit" aria-label={t('nav_search')}
                className="px-4 rounded-r-full bg-simba-navy text-white flex items-center justify-center">
                <Search className="w-4 h-4" />
              </button>
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
              { to: '/contact', label: t('nav_contact'), Icon: Phone },
            ].map(({ to, label, Icon }) => (
              <Link key={to} to={to} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium">
                <Icon className="w-5 h-5 text-simba-red" />{label}
              </Link>
            ))}
            {(profile?.role === 'admin' || profile?.role === 'branch_manager') && (
              <Link to="/admin" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium">
                <LayoutDashboard className="w-5 h-5 text-simba-red" />{t('nav_dashboard')}
              </Link>
            )}
            <div className="flex items-center justify-between px-3 py-2">
              <LanguageSwitcher />
              <DarkModeToggle />
            </div>
            {user && (<>
              <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium">
                <User className="w-5 h-5 text-simba-red" />{t('my_profile')}
              </Link>
              <Link to="/my-orders" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-medium">
                <ShoppingBag className="w-5 h-5 text-simba-red" />{t('my_orders_title')}
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 rounded-xl text-simba-red hover:bg-red-50 dark:hover:bg-red-900/20 font-medium w-full">
                <LogOut className="w-5 h-5" />{t('nav_logout')}
              </button>
            </>)}
            {!user && (
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
        <Link to={user ? '/profile' : '/login'} className="flex flex-col items-center gap-0.5 px-3 py-1">
          <User className={`w-5 h-5 ${location.pathname === '/profile' || location.pathname === '/login' ? 'text-simba-red' : 'text-gray-400'}`} />
          <span className={`text-xs ${location.pathname === '/profile' || location.pathname === '/login' ? 'text-simba-red font-semibold' : 'text-gray-400'}`}>
            {user ? t('my_profile') : t('nav_login')}
          </span>
        </Link>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
