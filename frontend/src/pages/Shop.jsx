import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'
import { getProducts, getCategories } from '../api/products.js'
import ProductCard from '../components/ProductCard.jsx'
import SkeletonCard from '../components/SkeletonCard.jsx'

const CATEGORY_ICONS = {
  "Alcoholic Drinks": "🍷", "Baby Products": "🍼", "Cleaning & Sanitary": "🧹",
  "Cosmetics & Personal Care": "💄", "Food Products": "🥗", "General": "🛒",
  "Kitchen Storage": "🗄️", "Kitchenware & Electronics": "🍳", "Pet Care": "🐾",
  "Sports & Wellness": "💪",
}

const SORT_OPTIONS = [
  { value: '', labelKey: 'sort_default' },
  { value: 'price_asc', labelKey: 'sort_price_asc' },
  { value: 'price_desc', labelKey: 'sort_price_desc' },
  { value: 'name_asc', labelKey: 'sort_name' },
]

const LIMIT = 20

export default function Shop() {
  const { t } = useLang()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [priceMinInput, setPriceMinInput] = useState(searchParams.get('price_min') || '')
  const [priceMaxInput, setPriceMaxInput] = useState(searchParams.get('price_max') || '')
  const searchTimeout = useRef(null)
  const priceTimeout = useRef(null)

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const sort = searchParams.get('sort') || ''
  const priceMin = searchParams.get('price_min') || ''
  const priceMax = searchParams.get('price_max') || ''

  const updateParams = useCallback((updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v) next.set(k, v)
        else next.delete(k)
      })
      if ('category' in updates || 'search' in updates || 'sort' in updates ||
          'price_min' in updates || 'price_max' in updates) {
        next.delete('page')
      }
      return next
    })
  }, [setSearchParams])

  useEffect(() => {
    setLoading(true)
    getProducts({ category, search, page, sort, limit: LIMIT, price_min: priceMin || undefined, price_max: priceMax || undefined })
      .then((data) => {
        setProducts(data.products)
        setTotal(data.total)
        setPages(data.pages)
      })
      .finally(() => setLoading(false))
  }, [category, search, page, sort, priceMin, priceMax])

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    setSearchInput(searchParams.get('search') || '')
    setPriceMinInput(searchParams.get('price_min') || '')
    setPriceMaxInput(searchParams.get('price_max') || '')
  }, [searchParams])

  useEffect(() => {
    return () => {
      clearTimeout(searchTimeout.current)
      clearTimeout(priceTimeout.current)
    }
  }, [])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchInput(val)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      updateParams({ search: val })
    }, 400)
  }

  const handlePriceMinChange = (e) => {
    const val = e.target.value
    setPriceMinInput(val)
    clearTimeout(priceTimeout.current)
    priceTimeout.current = setTimeout(() => {
      updateParams({ price_min: val })
    }, 600)
  }

  const handlePriceMaxChange = (e) => {
    const val = e.target.value
    setPriceMaxInput(val)
    clearTimeout(priceTimeout.current)
    priceTimeout.current = setTimeout(() => {
      updateParams({ price_max: val })
    }, 600)
  }

  const shouldGroup = search && !category
  const groupedProducts = useMemo(() => {
    if (!shouldGroup) return null
    return products.reduce((acc, p) => {
      const cat = p.category || 'Other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(p)
      return acc
    }, {})
  }, [products, shouldGroup])

  const clearPriceFilter = () => {
    setPriceMinInput('')
    setPriceMaxInput('')
    updateParams({ price_min: '', price_max: '' })
  }

  const start = total === 0 ? 0 : (page - 1) * LIMIT + 1
  const end = Math.min(page * LIMIT, total)

  return (
    <div className="page-enter min-h-screen pt-28 pb-28 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm sticky top-24 space-y-5">
              <div>
                <h3 className="font-heading font-bold text-lg mb-4">{t('cat_title')}</h3>
                <button
                  onClick={() => updateParams({ category: '' })}
                  className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors ${
                    !category ? 'bg-simba-red text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t('all_categories')}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => updateParams({ category: cat.name })}
                    className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors flex items-center justify-between ${
                      category === cat.name ? 'bg-simba-red text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${category === cat.name ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <h3 className="font-heading font-bold text-sm mb-3 text-gray-800 dark:text-gray-200">{t('price_filter')}</h3>
                <div className="space-y-2">
                  <input
                    type="number"
                    min="0"
                    value={priceMinInput}
                    onChange={handlePriceMinChange}
                    placeholder={t('price_min')}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:border-simba-red focus:outline-none text-gray-800 dark:text-gray-200"
                  />
                  <input
                    type="number"
                    min="0"
                    value={priceMaxInput}
                    onChange={handlePriceMaxChange}
                    placeholder={t('price_max')}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:border-simba-red focus:outline-none text-gray-800 dark:text-gray-200"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={clearPriceFilter}
                      className="flex-1 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {t('clear_filter')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder={t('search_placeholder')}
                  className="w-full pl-9 pr-10 py-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-simba-red focus:outline-none text-sm shadow-sm"
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput('')
                      updateParams({ search: '' })
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="py-3 px-4 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-simba-red focus:outline-none text-sm shadow-sm text-gray-700 dark:text-gray-300"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4 lg:hidden">
              <button
                onClick={() => updateParams({ category: '' })}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${!category ? 'bg-simba-red text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
              >
                {t('filter_all')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => updateParams({ category: cat.name })}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${category === cat.name ? 'bg-simba-red text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {!loading && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {total > 0
                  ? `${t('showing')} ${start}-${end} ${t('of')} ${total} ${t('results')}`
                  : t('no_results')
                }
              </p>
            )}

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-700" />
                <h3 className="font-heading font-bold text-xl text-gray-800 dark:text-gray-200 mb-2">{t('no_results')}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{t('no_results_sub')}</p>
                <button onClick={() => { setSearchInput(''); setSearchParams({}) }} className="btn-primary">
                  {t('filter_all')}
                </button>
              </div>
            ) : shouldGroup && groupedProducts ? (
              Object.entries(groupedProducts).map(([category, items]) => (
                <div key={category} className="mb-8">
                  <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <span>{CATEGORY_ICONS[category] || '🛒'}</span>
                    {category}
                    <span className="text-xs font-normal text-gray-400">({items.length})</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {items.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {pages > 1 && !loading && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: String(page - 1) })}
                  className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:border-simba-red transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                  let p2
                  if (pages <= 7) p2 = i + 1
                  else if (page <= 4) p2 = i + 1
                  else if (page >= pages - 3) p2 = pages - 6 + i
                  else p2 = page - 3 + i
                  return (
                    <button
                      key={p2}
                      onClick={() => updateParams({ page: String(p2) })}
                      className={`w-9 h-9 rounded-full text-sm font-bold transition-all duration-200 ${
                        p2 === page ? 'bg-simba-red text-white scale-110' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-simba-red text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {p2}
                    </button>
                  )
                })}
                <button
                  disabled={page >= pages}
                  onClick={() => updateParams({ page: String(page + 1) })}
                  className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:border-simba-red transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
