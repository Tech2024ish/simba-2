import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { User, ShoppingBag, Mail, Phone, Save, ArrowRight } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toast.jsx'

export default function Profile() {
  const { t } = useLang()
  const { user, profile } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState({ full_name: '', phone: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name || '', phone: profile.phone || '' })
  }, [profile])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('profiles')
      .update({ full_name: form.full_name.trim(), phone: form.phone.trim() })
      .eq('id', user.id)
    if (error) addToast(t('error_load'), 'error')
    else addToast(t('profile_saved'), 'success')
    setSaving(false)
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200'

  return (
    <div className="page-enter min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-8 flex items-center gap-3">
          <User className="w-7 h-7 text-simba-red" /> {t('profile_title')}
        </h1>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link to="/my-orders" className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-full bg-simba-red/10 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-simba-red" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 dark:text-gray-200">{t('my_orders_title')}</p>
              <p className="text-xs text-gray-400">{t('order_status')}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-simba-red transition-colors" />
          </Link>
          <div className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-simba-red flex items-center justify-center">
              <span className="text-white font-bold text-lg">{profile?.full_name?.[0]?.toUpperCase() || '?'}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{profile?.full_name || t('my_profile')}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white mb-5">{t('profile_info')}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                <User className="w-4 h-4" /> {t('name_label')}
              </label>
              <input type="text" value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4" /> {t('email_label')}
              </label>
              <input type="email" value={user?.email || ''} disabled
                className={`${inputClass} opacity-60 cursor-not-allowed`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                <Phone className="w-4 h-4" /> {t('phone_label')}
              </label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+250 700 000 000" className={inputClass} />
            </div>
            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-simba-red text-white rounded-full py-3 font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
              {saving
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('loading')}</>
                : <><Save className="w-4 h-4" /> {t('profile_save')}</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
