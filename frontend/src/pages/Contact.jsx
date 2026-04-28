import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'
import { supabase } from '../context/AuthContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Contact() {
  const { t } = useLang()
  const { user, profile } = useAuth()

  const [form, setForm] = useState({
    name: profile?.full_name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return
    setSending(true)
    setError('')
    const { error: err } = await supabase.from('contact_messages').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
      user_id: user?.id || null,
    })
    if (err) {
      setError(t('error_load'))
    } else {
      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    }
    setSending(false)
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200 transition-colors'

  return (
    <div className="page-enter min-h-screen pt-24 pb-16">
      {/* Header */}
      <section className="bg-gradient-to-br from-simba-navy to-blue-900 py-16 px-4 text-center">
        <h1 className="font-heading font-bold text-4xl text-white mb-3">{t('contact_title')}</h1>
        <p className="text-white/70 text-lg">{t('contact_hours')}</p>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid md:grid-cols-2 gap-12">

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-heading font-bold text-2xl text-gray-900 dark:text-white mb-2">{t('contact_title')}</h2>
              <p className="text-gray-500 dark:text-gray-400">{t('about_desc')}</p>
            </div>

            {[
              { icon: MapPin,  label: 'Union Trade Centre, KN 4 Ave, Kigali', sub: t('our_branches') },
              { icon: Phone,   label: '+250 700 000 000',               sub: t('contact_hours') },
              { icon: Mail,    label: 'info@simbasupermarket.rw',        sub: t('contact_title') },
              { icon: Clock,   label: '7:00 AM – 10:00 PM',             sub: t('stores_open') },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                <div className="w-10 h-10 rounded-full bg-simba-red/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-simba-red" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 gap-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white">{t('contact_sent')}</h3>
                <button onClick={() => setSent(false)} className="text-simba-red text-sm font-semibold hover:underline">
                  {t('write_review')} →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-6">{t('contact_send')}</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('form_name')} *</label>
                    <input type="text" required value={form.name} onChange={set('name')}
                      placeholder={t('contact_name_ph')} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('email_label')} *</label>
                    <input type="email" required value={form.email} onChange={set('email')}
                      placeholder={t('contact_email_ph')} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('contact_subject')}</label>
                  <input type="text" value={form.subject} onChange={set('subject')}
                    placeholder={t('contact_subject_ph')} className={inputClass} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('contact_message')} *</label>
                  <textarea required rows={5} value={form.message} onChange={set('message')}
                    placeholder={t('contact_message_ph')}
                    className={`${inputClass} resize-none`} />
                </div>

                {error && <p className="text-simba-red text-sm">{error}</p>}

                <button type="submit" disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-simba-red text-white rounded-full py-3.5 font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
                  {sending
                    ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('processing')}</>
                    : <><Send className="w-5 h-5" /> {t('contact_send')}</>
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
