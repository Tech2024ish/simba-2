import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQty, total, count } = useCart()
  const { t } = useLang()
  const navigate = useNavigate()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-simba-red" />
              <h2 className="font-bold font-heading text-lg">{t('cart_title')}</h2>
              {count > 0 && (
                <span className="bg-simba-red text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <ShoppingBag className="w-16 h-16 text-gray-200 dark:text-gray-700" />
                <p className="text-gray-400 dark:text-gray-500 font-medium">{t('cart_empty')}</p>
                <button
                  onClick={() => { navigate('/shop'); onClose() }}
                  className="btn-primary text-sm"
                >
                  {t('hero_cta')}
                </button>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight">{item.name}</p>
                    <p className="text-simba-red font-bold text-sm mt-1">RWF {item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-simba-red hover:text-white transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-sm w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-simba-red hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1.5 text-gray-400 hover:text-simba-red transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 font-medium">{t('cart_sub')}</span>
                <span className="font-bold text-xl text-simba-red">RWF {total.toLocaleString()}</span>
              </div>
              <button
                onClick={() => { navigate('/checkout'); onClose() }}
                className="w-full btn-primary text-center"
              >
                {t('cart_checkout')}
              </button>
              <button
                onClick={() => { navigate('/shop'); onClose() }}
                className="w-full btn-outline text-center text-sm"
              >
                {t('cart_continue')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
