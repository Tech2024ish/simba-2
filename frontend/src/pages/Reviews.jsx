import { useState, useEffect } from 'react'
import { Star, Send, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext.jsx'
import { supabase } from '../context/AuthContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Reviews() {
  const { t } = useLang()
  const { user, profile } = useAuth()

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
    if (data) setReviews(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.comment.trim()) return
    setSubmitting(true)
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      user_name: profile?.full_name || user.email.split('@')[0],
      rating: form.rating,
      comment: form.comment.trim(),
    })
    if (!error) {
      setMsg(t('review_submitted'))
      setForm({ rating: 5, comment: '' })
      load()
    }
    setSubmitting(false)
    setTimeout(() => setMsg(''), 4000)
  }

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <div className="page-enter min-h-screen pt-24 pb-16">
      {/* Header */}
      <section className="bg-gradient-to-br from-simba-navy to-blue-900 py-16 px-4 text-center">
        <h1 className="font-heading font-bold text-4xl text-white mb-3">{t('reviews_title')}</h1>
        <p className="text-white/70 text-lg mb-6">{t('reviews_sub')}</p>
        {avg && (
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
            <span className="font-heading font-bold text-3xl text-yellow-400">{avg}</span>
            <div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(avg) ? 'text-yellow-400 fill-yellow-400' : 'text-white/30'}`} />
                ))}
              </div>
              <p className="text-white/60 text-xs mt-0.5">{reviews.length} {t('results')}</p>
            </div>
          </div>
        )}
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Reviews list */}
          <div className="lg:col-span-2">
            <h2 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-6">
              {reviews.length} {t('results')}
            </h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('reviews_empty')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-simba-red flex items-center justify-center text-white font-bold shrink-0">
                          {r.user_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{r.user_name}</p>
                          <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write review */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-simba-red" /> {t('write_review')}
              </h3>

              {!user ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('sign_in_checkout')}</p>
                  <Link to="/login" className="btn-primary text-sm">{t('sign_in')}</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('your_rating')}</label>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button key={i} type="button" onClick={() => setForm(f => ({ ...f, rating: i + 1 }))}>
                          <Star className={`w-8 h-8 transition-colors ${i < form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('your_comment')} *</label>
                    <textarea rows={4} required value={form.comment}
                      onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                      placeholder={t('review_placeholder')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200 resize-none" />
                  </div>
                  {msg && <p className="text-sm text-green-600 font-medium">{msg}</p>}
                  <button type="submit" disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-simba-red text-white rounded-full py-3 font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
                    <Send className="w-4 h-4" />
                    {submitting ? '...' : t('submit_review')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
