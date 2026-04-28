import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Package } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from './Toast.jsx'
import { useLang } from '../context/LangContext.jsx'

const CATEGORY_ICONS = {
  "Alcoholic Drinks": "🍷",
  "Baby Products": "🍼",
  "Cleaning & Sanitary": "🧹",
  "Cosmetics & Personal Care": "💄",
  "Food Products": "🥗",
  "General": "🛒",
  "Kitchen Storage": "🗄️",
  "Kitchenware & Electronics": "🍳",
  "Pet Care": "🐾",
  "Sports & Wellness": "💪"
}

const getImageSrc = (product) => {
  if (!product.image || product.image.includes('placehold.co')) {
    return `https://picsum.photos/seed/simba-${product.id}/300/300`
  }
  return product.image
}

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { addToast } = useToast()
  const { t } = useLang()

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addItem(product)
    addToast(`${product.name} added to cart!`, 'success')
  }

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="card overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
        <img
          src={getImageSrc(product)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/simba-fallback-${product.id}/300/300`
            e.target.onerror = null
          }}
        />
        <div className="absolute top-2 left-2">
          <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
            {CATEGORY_ICONS[product.category] || '🛒'} {product.category}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {t('in_stock')}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm leading-tight mb-2 font-heading">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <Package className="w-3 h-3" />
          <span>{product.unit}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-simba-red text-lg">
            RWF {product.price.toLocaleString()}
          </p>
        </div>
        <button
          onClick={handleAddToCart}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-simba-red text-white rounded-full py-2.5 text-sm font-semibold hover:bg-red-700 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <ShoppingCart className="w-4 h-4" />
          {t('add_cart')}
        </button>
      </div>
    </div>
  )
}
