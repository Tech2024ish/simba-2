import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Truck, Shield, Clock, Star, MapPin, ChevronDown, Send, Phone, Mail, MessageSquare, LayoutDashboard } from 'lucide-react'

import { useLang } from '../context/LangContext.jsx'
import { supabase } from '../context/AuthContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getProducts, getCategories } from '../api/products.js'
import ProductCard from '../components/ProductCard.jsx'
import SkeletonCard from '../components/SkeletonCard.jsx'

const BRANCHES = [
  { name: 'City Center (UTC)', address: 'Union Trade Centre, 1 KN 4 Ave, Kigali', query: '3336+MHV Kigali Rwanda' },
  { name: 'KN 5 Road',         address: 'KN 5 Rd, Kigali',                        query: 'Simba Supermarket KN 5 Rd Kigali Rwanda' },
  { name: 'KG 541 Branch',     address: 'KG 541 St, Kigali',                      query: 'Simba Supermarket KG 541 St Kigali Rwanda' },
  { name: 'Remera',            address: '24Q5+R2R, Kigali',                       query: '24Q5+R2R Kigali Rwanda' },
  { name: 'Kimironko',         address: '342F+3V5, Kimironko, Kigali',            query: '342F+3V5 Kimironko Kigali Rwanda' },
  { name: 'Nyamirambo',        address: '23H4+26V, Kigali',                       query: '23H4+26V Kigali Rwanda' },
  { name: 'Gisozi',            address: '24G3+MCV, Kigali',                       query: '24G3+MCV Kigali Rwanda' },
  { name: 'KK 35 Branch',      address: 'KK 35 Ave, Kigali',                      query: 'Simba Supermarket KK 35 Ave Kigali Rwanda' },
  { name: 'Kicukiro',          address: '24J3+Q3, Kigali',                        query: '24J3+Q3 Kigali Rwanda' },
  { name: 'Gisenyi (Rubavu)',  address: '8754+P7W, Gisenyi',                      query: '8754+P7W Gisenyi Rwanda' },
]

const CATEGORY_ICONS = {
  "Alcoholic Drinks": "🍷", "Baby Products": "🍼", "Cleaning & Sanitary": "🧹",
  "Cosmetics & Personal Care": "💄", "Food Products": "🥗", "General": "🛒",
  "Kitchen Storage": "🗄️", "Kitchenware & Electronics": "🍳", "Pet Care": "🐾",
  "Sports & Wellness": "💪",
}

export default function Home() {
  const { t } = useLang()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0])

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewMsg, setReviewMsg] = useState('')

  useEffect(() => {
    Promise.all([
      getProducts({ limit: 8 }),
      getCategories()
    ]).then(([pd, cats]) => {
      setProducts(pd.products)
      setCategories(cats)
    }).finally(() => setLoading(false))

    supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => { if (data) setReviews(data) })
  }, [])

  const submitReview = async (e) => {
    e.preventDefault()
    if (!reviewForm.comment.trim()) return
    setSubmittingReview(true)
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      user_name: profile?.full_name || user.email.split('@')[0],
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
    })
    if (!error) {
      setReviewMsg(t('review_submitted'))
      setReviewForm({ rating: 5, comment: '' })
      const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(6)
      if (data) setReviews(data)
    }
    setSubmittingReview(false)
    setTimeout(() => setReviewMsg(''), 3000)
  }

  return (
    <div className="page-enter min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-simba-navy via-blue-900 to-simba-navy pt-28 pb-16 md:pt-32 md:pb-24">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🦁</div>
          <div className="absolute bottom-10 right-10 text-9xl">🛒</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] opacity-30">🛍️</div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-simba-orange/20 border border-simba-orange/30 text-simba-orange rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              <Star className="w-4 h-4 fill-simba-orange" />
              {t('hero_badge')}
            </div>

            <h1 className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6 whitespace-pre-line">
              {t('hero_title')}
            </h1>

            <p className="text-white/70 text-lg md:text-xl max-w-xl mb-8">
              {t('hero_sub')}
            </p>

            {/* Branch selector */}
            <div className="relative max-w-sm mb-8">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-simba-orange" />
              <select
                value={selectedBranch.name}
                onChange={e => setSelectedBranch(BRANCHES.find(b => b.name === e.target.value))}
                className="w-full appearance-none pl-10 pr-10 py-3 rounded-full bg-white/10 border border-white/30 text-white font-semibold focus:bg-white/20 focus:border-simba-orange focus:outline-none cursor-pointer transition-colors"
              >
                {BRANCHES.map(b => (
                  <option key={b.name} value={b.name} className="text-gray-900 bg-white">
                    {b.name} — {b.address}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
            </div>

            <div className="flex flex-wrap gap-4 mb-12">
              <button
                onClick={() => navigate('/shop')}
                className="flex items-center gap-2 bg-simba-red text-white rounded-full px-8 py-4 font-bold text-lg hover:scale-105 hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-900/30"
              >
                {t('hero_cta')} <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.getElementById('categories').scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 border-2 border-white/30 text-white rounded-full px-8 py-4 font-bold text-lg hover:bg-white/10 transition-all duration-200"
              >
                {t('hero_secondary')}
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {[
                { icon: '📦', label: t('hero_stat1') },
                { icon: '🚀', label: t('hero_stat2') },
                { icon: '📍', label: t('hero_stat3') },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-white/80">
                  <span className="text-xl">{s.icon}</span>
                  <span className="font-semibold text-sm">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Truck, textKey: 'trust_fast', subKey: 'trust_fast_sub' },
              { icon: Shield, textKey: 'trust_secure', subKey: 'trust_secure_sub' },
              { icon: Clock, textKey: 'trust_returns', subKey: 'trust_returns_sub' },
            ].map(({ icon: Icon, textKey, subKey }) => (
              <div key={textKey} className="flex flex-row items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-simba-red/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-simba-red" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{t(textKey)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t(subKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multilingual Showcase — visible proof of 3-language support */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="/?lang=en" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-simba-red transition-colors no-underline">
              <span className="text-2xl">🇬🇧</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">English</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Fresh Groceries, Delivered Fast</p>
              </div>
            </a>
            <a href="/?lang=fr" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-simba-red transition-colors no-underline">
              <span className="text-2xl">🇫🇷</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Français</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Courses Fraîches, Livrées Rapidement</p>
              </div>
            </a>
            <a href="/?lang=rw" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-simba-red transition-colors no-underline">
              <span className="text-2xl">🇷🇼</span>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kinyarwanda</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Ibiribwa Bishya, Bitanzwa Vuba</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Market Rep Demo Banner */}
      <section className="bg-simba-navy/5 dark:bg-gray-800/50 border-y border-simba-navy/10 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-simba-navy flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{t('demo_title')}: {t('demo_rep_label')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">admin@test.com &nbsp;/&nbsp; admin123</p>
              </div>
            </div>
            <Link
              to="/admin"
              className="shrink-0 flex items-center gap-2 bg-simba-navy text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-blue-900 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" /> {t('nav_dashboard')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white">
            {t('cat_title')}
          </h2>
          <Link to="/shop" className="text-simba-red font-semibold text-sm hover:underline flex items-center gap-1">
            {t('view_all')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="relative max-w-sm">
          <select
            defaultValue=""
            onChange={e => { if (e.target.value) navigate(`/shop?category=${encodeURIComponent(e.target.value)}`) }}
            className="w-full appearance-none pl-4 pr-10 py-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium shadow-sm focus:border-simba-red focus:outline-none cursor-pointer transition-colors"
          >
            <option value="" disabled>{t('all_categories')}</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>
                {CATEGORY_ICONS[cat.name] || '🛒'} {cat.name} ({cat.count})
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white dark:bg-gray-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white">
              {t('feat_title')}
            </h2>
            <Link to="/shop" className="text-simba-red font-semibold text-sm hover:underline flex items-center gap-1">
              {t('view_all')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : products.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
          <div className="text-center mt-10">
            <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
              {t('view_all')} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Store Locations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-8">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-2">
            {t('stores_title')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">{t('stores_sub')}</p>
        </div>

        {/* Selected branch info */}
        <div className="max-w-md mx-auto mb-4 flex items-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">{t('stores_open')}</span>
          <span className="text-gray-400 mx-1">·</span>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(selectedBranch.query)}`}
            target="_blank" rel="noopener noreferrer"
            className="text-sm text-simba-red dark:text-red-400 font-medium hover:underline truncate"
          >{selectedBranch.address}</a>
        </div>

        {/* Embedded map */}
        <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800" style={{ height: '420px' }}>
          <iframe
            key={selectedBranch.name}
            title={selectedBranch.name}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedBranch.query)}&output=embed&hl=en`}
          />
        </div>

        <div className="text-center mt-4">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(selectedBranch.query)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-simba-red font-semibold text-sm hover:underline"
          >
            <MapPin className="w-4 h-4" /> {t('stores_directions')}
          </a>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="bg-white dark:bg-gray-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-bold text-simba-orange uppercase tracking-widest">{t('about_sub')}</span>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white mt-2 mb-4">{t('about_title')}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{t('about_desc')}</p>
              <div className="bg-simba-red/5 dark:bg-simba-red/10 border border-simba-red/20 rounded-2xl p-5">
                <h3 className="font-heading font-bold text-simba-red mb-2">{t('about_mission')}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{t('about_mission_desc')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              {[
                { value: '10+', label: t('our_branches') },
                { value: '552', label: t('dash_products') },
                { value: '1989', label: t('hero_stat3').replace('Kigali, ','') + ' est.' },
                { value: '24/7', label: t('trust_returns_sub') },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center">
                  <p className="font-heading font-bold text-3xl text-simba-red mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-2">{t('reviews_title')}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t('reviews_sub')}</p>
        </div>

        {/* Review cards */}
        {reviews.length === 0 ? (
          <p className="text-center text-gray-400 mb-8">{t('reviews_empty')}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {reviews.map(r => (
              <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">"{r.comment}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-simba-red flex items-center justify-center text-white text-xs font-bold">
                    {r.user_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{r.user_name}</p>
                    <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Write review form */}
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-simba-red" /> {t('write_review')}
          </h3>
          {!user ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              <Link to="/login" className="text-simba-red font-semibold hover:underline">{t('sign_in')}</Link> {t('review_sign_in_prompt').replace(`${t('sign_in')} `, '')}
            </p>
          ) : (
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('your_rating')}</label>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: i + 1 }))}>
                      <Star className={`w-7 h-7 transition-colors ${i < reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('your_comment')}</label>
                <textarea rows={3} required value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder={t('review_placeholder')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200 resize-none" />
              </div>
              {reviewMsg && <p className="text-sm text-green-600 font-medium">{reviewMsg}</p>}
              <button type="submit" disabled={submittingReview}
                className="w-full flex items-center justify-center gap-2 bg-simba-red text-white rounded-full py-3 font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" /> {submittingReview ? '...' : t('submit_review')}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="bg-simba-navy dark:bg-gray-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-2">{t('contact_title')}</h2>
            <p className="text-white/60">{t('contact_hours')}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: MapPin,  label: 'Kigali, Rwanda', sub: t('stores_sub') },
              { icon: Phone,   label: '+250 700 000 000', sub: t('contact_hours') },
              { icon: Mail,    label: 'info@simbasupermarket.rw', sub: t('contact_title') },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center gap-3 bg-white/5 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full bg-simba-orange/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-simba-orange" />
                </div>
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-white/50 text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="bg-gradient-to-r from-simba-red to-red-700 rounded-3xl p-10 md:p-16 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 text-[120px] flex items-center justify-center">🛒</div>
          <div className="relative">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
              {t('cta_title')}
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              {t('cta_sub')}
            </p>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-simba-red font-bold px-8 py-4 rounded-full hover:scale-105 transition-all duration-200 shadow-lg">
              {t('hero_cta')} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
