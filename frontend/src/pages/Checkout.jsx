import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Smartphone, Banknote, CreditCard, ChevronRight, Lock } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { createOrder } from '../api/orders.js'
import { useToast } from '../components/Toast.jsx'

const PAYMENT_METHODS = [
  { id: 'momo', icon: Smartphone, labelKey: 'payment_momo', color: 'text-yellow-600' },
  { id: 'cash', icon: Banknote, labelKey: 'payment_cash', color: 'text-green-600' },
  { id: 'card', icon: CreditCard, labelKey: 'payment_card', color: 'text-blue-600' },
]

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms)
    }),
  ])
}

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const { user, profile, getToken } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items])

  const [form, setForm] = useState({
    name: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    address: '',
    city: 'Kigali',
    payment: 'momo',
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const normalizedItems = useMemo(() => (
    items
      .map((item) => {
        const price = Number(item.price)
        const qty = Number(item.qty)

        if (!Number.isFinite(price) || !Number.isFinite(qty) || qty < 1) {
          return null
        }

        return {
          id: item.id,
          name: String(item.name || '').trim(),
          price,
          qty,
          image: item.image || '',
        }
      })
      .filter(Boolean)
  ), [items])

  const normalizedTotal = useMemo(
    () => normalizedItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [normalizedItems]
  )

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: current.name || profile?.full_name || '',
      email: current.email || user?.email || '',
      phone: current.phone || profile?.phone || '',
    }))
  }, [profile?.full_name, profile?.phone, user?.email])

  if (!user) {
    return (
      <div className="page-enter min-h-screen pt-28 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <Lock className="w-16 h-16 text-simba-red mx-auto" />
          <h2 className="font-heading font-bold text-2xl text-gray-800 dark:text-gray-200">{t('sign_in_checkout')}</h2>
          <Link to="/login?next=/checkout" className="btn-primary inline-flex items-center gap-2">
            {t('sign_in')} <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.email.trim()) errs.email = 'Required'
    if (!form.phone.trim()) errs.phone = 'Required'
    if (!form.address.trim()) errs.address = 'Required'
    if (!form.city.trim()) errs.city = 'Required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    if (items.length === 0) {
      addToast('Your cart is empty.', 'info')
      navigate('/shop')
      return
    }
    if (normalizedItems.length !== items.length || normalizedTotal <= 0) {
      addToast('Your cart has invalid items. Please update it and try again.', 'error')
      navigate('/cart')
      return
    }

    setSubmitting(true)
    try {
      const token = await withTimeout(getToken(), 10000, 'Session timed out')
      if (!token) {
        throw new Error('Missing session')
      }

      await withTimeout(createOrder({
        items: normalizedItems,
        total: normalizedTotal,
        payment_method: form.payment,
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
      }, token), 30000, 'Checkout timed out')

      clearCart()
      addToast('Order placed successfully.', 'success')
      navigate('/order-success')
    } catch (err) {
      const message = err?.message === 'Session timed out'
        ? 'Your session took too long to load. Please sign in again and retry.'
        : err?.code === 'ECONNABORTED' || err?.message === 'Checkout timed out'
        ? 'Checkout timed out. Please try again.'
        : err?.response?.data?.detail || 'We could not place your order right now. Please try again.'
      addToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((er) => {
      const ne = { ...er }
      delete ne[field]
      return ne
    })
  }

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl border ${errors[field] ? 'border-simba-red' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 focus:border-simba-red focus:outline-none text-gray-800 dark:text-gray-200 text-sm transition-all`

  return (
    <div className="page-enter min-h-screen pt-28 pb-28 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-8 flex items-center gap-2">
          <Lock className="w-6 h-6 text-simba-red" /> {t('checkout_title')}
        </h1>

        {items.length === 0 && (
          <div className="card p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white">Your cart is empty</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add a few products before placing an order.</p>
            </div>
            <Link to="/shop" className="btn-primary text-center">Continue shopping</Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <h2 className="font-heading font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">{t('delivery_info')}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('form_name')} *</label>
                    <input type="text" value={form.name} onChange={set('name')} className={inputClass('name')} placeholder="John Doe" />
                    {errors.name && <p className="text-simba-red text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('form_email')} *</label>
                    <input type="email" value={form.email} onChange={set('email')} className={inputClass('email')} placeholder="john@example.com" />
                    {errors.email && <p className="text-simba-red text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('form_phone')} *</label>
                    <input type="tel" value={form.phone} onChange={set('phone')} className={inputClass('phone')} placeholder="+250 700 000 000" />
                    {errors.phone && <p className="text-simba-red text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('form_city')} *</label>
                    <input type="text" value={form.city} onChange={set('city')} className={inputClass('city')} placeholder="Kigali" />
                    {errors.city && <p className="text-simba-red text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('form_address')} *</label>
                    <input type="text" value={form.address} onChange={set('address')} className={inputClass('address')} placeholder="KG 123 St, Kicukiro" />
                    {errors.address && <p className="text-simba-red text-xs mt-1">{errors.address}</p>}
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-heading font-bold text-lg mb-4 text-gray-800 dark:text-gray-200">{t('payment_title')}</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(({ id, icon: Icon, labelKey, color }) => (
                    <label key={id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.payment === id ? 'border-simba-red bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value={id}
                        checked={form.payment === id}
                        onChange={() => setForm((f) => ({ ...f, payment: id }))}
                        className="w-4 h-4 accent-simba-red"
                      />
                      <Icon className={`w-6 h-6 ${color}`} />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{t(labelKey)}</p>
                        {id === 'momo' && form.payment === 'momo' && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('momo_hint')}</p>
                        )}
                      </div>
                      {form.payment === id && (
                        <div className="w-5 h-5 rounded-full bg-simba-red flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="card p-6 sticky top-24 space-y-4">
                <h2 className="font-heading font-bold text-lg text-gray-800 dark:text-gray-200">{t('order_summary')}</h2>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-2 leading-tight">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">x {item.qty}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 shrink-0">RWF {(item.price * item.qty).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{t('cart_sub')}</span><span>RWF {normalizedTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{t('trust_fast')}</span><span className="text-green-600 font-medium">{t('delivery_free')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t border-gray-100 dark:border-gray-700 pt-3">
                    <span className="text-gray-800 dark:text-gray-200">{t('order_total_label')}</span>
                    <span className="text-simba-red">RWF {normalizedTotal.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {submitting ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('processing')}</>
                  ) : (
                    <><Lock className="w-5 h-5" /> {t('place_order')}</>
                  )}
                </button>
                <p className="text-xs text-center text-gray-400">{itemCount} {itemCount === 1 ? 'item' : 'items'} - RWF {normalizedTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
