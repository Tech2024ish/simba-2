import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, ArrowLeft, Package, Tag, ChevronRight, Star } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { getProduct, getProducts } from '../api/products.js'
import { getReviews } from '../api/reviews.js'
import ProductCard from '../components/ProductCard.jsx'
import { getProductImage } from '../utils/productImage.js'

export default function ProductDetail() {
  const { id } = useParams()
  const { t } = useLang()
  const { user } = useAuth()
  const { addItem } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    setLoading(true)
    setQty(1)
    getProduct(id)
      .then((p) => {
        setProduct(p)
        return getProducts({ category: p.category, limit: 4 })
      })
      .then((data) => setRelated(data.products.filter((p2) => p2.id !== parseInt(id))))
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false))
    getReviews().then(data => setReviews((data || []).slice(0, 4)))
  }, [id, navigate])

  const handleAddToCart = () => {
    addItem(product, qty)
    addToast(`${product.name} ${t('added_to_cart')}`, 'success')
  }

  if (loading) {
    return (
      <div className="page-enter min-h-screen pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-6 w-1/3 rounded-full" />
            <div className="skeleton h-10 w-full rounded-xl" />
            <div className="skeleton h-6 w-1/2 rounded-full" />
            <div className="skeleton h-14 w-full rounded-full mt-6" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="page-enter min-h-screen pt-24 pb-28 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 mt-4 flex-wrap">
          <Link to="/" className="hover:text-simba-red transition-colors">{t('nav_home')}</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/shop" className="hover:text-simba-red transition-colors">{t('nav_shop')}</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-simba-red transition-colors">{product.category}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 dark:text-gray-200 line-clamp-1 max-w-[200px]">{product.name}</span>
        </nav>

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-simba-red mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('back')}
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm aspect-square">
            <img
              src={product.image?.includes('placehold.co') ? getProductImage(product) : product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.onerror = null }}
            />
          </div>

          <div className="flex flex-col justify-center space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className="bg-simba-navy/10 dark:bg-simba-navy/30 text-simba-navy dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Tag className="w-3 h-3" /> {product.category}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${product.in_stock !== false ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                {product.in_stock !== false ? t('in_stock') : t('out_stock')}
              </span>
            </div>

            <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
              <Package className="w-4 h-4" />
              <span>{t('unit_label')}: <strong>{product.unit}</strong></span>
            </div>

            <div className="bg-gradient-to-r from-simba-red/5 to-transparent dark:from-simba-red/10 rounded-2xl p-5">
              <p className="text-4xl font-bold text-simba-red font-heading">
                RWF {product.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('per_unit')} {product.unit}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700 dark:text-gray-300">{t('qty_label')}:</span>
              <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-simba-red hover:text-white transition-colors font-bold shadow-sm"
                >
                  -
                </button>
                <span className="font-bold text-lg w-8 text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-7 h-7 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center hover:bg-simba-red hover:text-white transition-colors font-bold shadow-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={handleAddToCart} className="flex-1 btn-primary flex items-center justify-center gap-2 py-4 text-base">
                <ShoppingCart className="w-5 h-5" /> {t('add_cart')}
              </button>
              <button
                onClick={() => { handleAddToCart(); navigate('/checkout') }}
                className="flex-1 btn-outline py-4 text-base"
              >
                {t('cart_checkout')}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <h2 className="font-heading font-bold text-2xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" /> {t('product_reviews')}
          </h2>
          {reviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm">
              <Star className="w-10 h-10 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_reviews_yet')}</p>
              {user && (
                <Link to="/reviews" className="mt-3 inline-flex items-center gap-1 text-simba-red text-sm font-semibold hover:underline">
                  {t('be_first_review')} →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">"{r.comment}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-simba-red flex items-center justify-center text-white text-xs font-bold">
                      {r.user_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{r.user_name}</p>
                      <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading font-bold text-2xl text-gray-900 dark:text-white mb-6">{t('related')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
