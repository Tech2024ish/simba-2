import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Truck, Shield, Clock, Star, MapPin, ExternalLink } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'
import { getProducts, getCategories } from '../api/products.js'
import ProductCard from '../components/ProductCard.jsx'
import CategoryCard from '../components/CategoryCard.jsx'
import SkeletonCard from '../components/SkeletonCard.jsx'

export default function Home() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getProducts({ limit: 8 }),
      getCategories()
    ]).then(([pd, cats]) => {
      setProducts(pd.products)
      setCategories(cats)
    }).finally(() => setLoading(false))
  }, [])

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
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Truck, textKey: 'trust_fast', subKey: 'trust_fast_sub' },
              { icon: Shield, textKey: 'trust_secure', subKey: 'trust_secure_sub' },
              { icon: Clock, textKey: 'trust_returns', subKey: 'trust_returns_sub' },
            ].map(({ icon: Icon, textKey, subKey }) => (
              <div key={textKey} className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-full bg-simba-red/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-simba-red" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{t(textKey)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{t(subKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white">
            {t('cat_title')}
          </h2>
          <Link to="/shop" className="text-simba-red font-semibold text-sm hover:underline flex items-center gap-1">
            {t('view_all')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {categories.map(cat => (
            <CategoryCard key={cat.name} category={cat} />
          ))}
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
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-2">
            {t('stores_title')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">{t('stores_sub')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'City Center', address: 'Union Trade Centre, 1 KN 4 Ave, Kigali', plus: '3336+MHV' },
            { name: 'KN 5 Road', address: 'KN 5 Rd, Kigali', plus: null },
            { name: 'KG 541 Branch', address: 'KG 541 St, Kigali', plus: null },
            { name: 'Remera', address: '24Q5+R2R, Kigali', plus: '24Q5+R2R' },
            { name: 'Kimironko', address: 'KG 192 St, Kimironko, Kigali', plus: '24XF+XVV' },
            { name: 'Nyamirambo', address: '23H4+26V, Kigali', plus: '23H4+26V' },
            { name: 'Gisozi', address: '24G3+MCV, Kigali', plus: '24G3+MCV' },
            { name: 'KK 35 Branch', address: 'KK 35 Ave, Kigali', plus: null },
            { name: 'Kicukiro', address: '24J3+Q3, Kigali', plus: '24J3+Q3' },
            { name: 'Gisenyi', address: 'Gisenyi (Rubavu)', plus: '8754+P7W' },
          ].map(store => (
            <div key={store.name} className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-full bg-simba-red/10 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-simba-red" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{store.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{store.address}</p>
                <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  {t('stores_open')}
                </span>
              </div>
              {store.plus && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(store.plus + ', Kigali, Rwanda')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-simba-red hover:bg-simba-red/10 transition-colors"
                  title={t('stores_directions')}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
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
