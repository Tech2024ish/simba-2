import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck, ArrowRight, Package } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getOrders } from '../api/orders.js'

const STATUS_CONFIG = {
  pending:   { icon: Clock,        class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  approved:  { icon: CheckCircle,  class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  rejected:  { icon: XCircle,      class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  delivered: { icon: Truck,        class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
}

export default function MyOrders() {
  const { t } = useLang()
  const { getToken } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    getOrders(token)
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [getToken])

  return (
    <div className="page-enter min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-simba-red" /> {t('my_orders_title')}
          </h1>
          <Link to="/shop" className="text-simba-red font-semibold text-sm hover:underline flex items-center gap-1">
            {t('nav_shop')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-gray-700" />
            <h2 className="font-heading font-bold text-xl text-gray-800 dark:text-gray-200 mb-2">{t('my_orders_empty')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('my_orders_empty_sub')}</p>
            <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
              {t('hero_cta')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const SC = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const StatusIcon = SC.icon
              const items = Array.isArray(order.items) ? order.items : []
              return (
                <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-mono text-xs text-gray-400 mb-1">{t('order_id')}{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('order_placed')}: {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${SC.class}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {t(`status_${order.status}`)}
                      </span>
                      <p className="font-bold text-simba-red mt-1.5">RWF {order.total?.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {items.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="shrink-0 flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">{item.name}</span>
                        <span className="text-xs text-gray-400">×{item.qty}</span>
                      </div>
                    ))}
                    {items.length > 5 && (
                      <div className="shrink-0 flex items-center px-3 py-2 text-xs text-gray-400">
                        +{items.length - 5} {t('order_items_count')}
                      </div>
                    )}
                  </div>

                  {/* Status timeline */}
                  <div className="mt-4 flex items-center gap-1">
                    {['pending', 'approved', 'delivered'].map((s, i) => {
                      const steps = ['pending', 'approved', 'delivered']
                      const currentIdx = steps.indexOf(order.status)
                      const stepIdx = steps.indexOf(s)
                      const done = order.status === 'rejected' ? false : stepIdx <= currentIdx
                      return (
                        <div key={s} className="flex items-center flex-1">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${done ? 'bg-simba-red' : 'bg-gray-200 dark:bg-gray-700'}`} />
                          {i < 2 && <div className={`flex-1 h-0.5 ${done && stepIdx < currentIdx ? 'bg-simba-red' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                        </div>
                      )
                    })}
                    <span className="ml-2 text-xs text-gray-400">{t(`status_${order.status}`)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
