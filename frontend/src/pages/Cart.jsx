import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useLang } from '../context/LangContext.jsx'

export default function Cart() {
  const { items, removeItem, updateQty, total, count } = useCart()
  const { t } = useLang()
  const navigate = useNavigate()

  return (
    <div className="page-enter min-h-screen pt-28 pb-28 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-7 h-7 text-simba-red" />
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white">
            {t('cart_title')} {count > 0 && <span className="text-simba-red">({count})</span>}
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-7xl mb-6">🛒</div>
            <h2 className="font-heading font-bold text-2xl text-gray-800 dark:text-gray-200 mb-3">{t('cart_empty')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t('cart_empty_cta')}</p>
            <Link to="/shop" className="btn-primary flex items-center gap-2">
              {t('hero_cta')} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="card flex gap-4 p-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-xl shrink-0"
                    onError={e => { e.target.src = `https://placehold.co/200x200/f8f9fa/1D3557?text=${item.name.slice(0,2)}` }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 leading-tight mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{item.category}</p>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5">
                        <button onClick={() => { if (item.qty > 1) updateQty(item.id, item.qty - 1); else removeItem(item.id) }} className="w-6 h-6 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center hover:bg-simba-red hover:text-white transition-colors shadow-sm">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-sm w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center hover:bg-simba-red hover:text-white transition-colors shadow-sm">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-simba-red">RWF {(item.price * item.qty).toLocaleString()}</p>
                        <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-400 hover:text-simba-red transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={() => navigate('/shop')} className="flex items-center gap-2 text-gray-500 hover:text-simba-red transition-colors mt-4 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> {t('cart_continue')}
              </button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24 space-y-5">
                <h2 className="font-heading font-bold text-lg text-gray-800 dark:text-gray-200">{t('order_summary')}</h2>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span className="line-clamp-1 flex-1 pr-2">{item.name} × {item.qty}</span>
                      <span className="font-medium shrink-0">RWF {(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-800 dark:text-gray-200">{t('cart_sub')}</span>
                    <span className="text-simba-red">RWF {total.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">+ {t('checkout_delivery_fee')}</p>
                </div>
                <button onClick={() => navigate('/checkout')} className="w-full btn-primary flex items-center justify-center gap-2 py-4">
                  {t('cart_checkout')} <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
