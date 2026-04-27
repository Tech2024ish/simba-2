import { useState, useEffect, useCallback } from 'react'
import { LayoutDashboard, ShoppingBag, Package, TrendingUp, Clock, CheckCircle, XCircle, Truck, Search, ChevronDown, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { getDashboardStats } from '../api/dashboard.js'
import { getOrders, updateOrder } from '../api/orders.js'

const STATUS_CONFIG = {
  pending: { label: 'status_pending', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  approved: { label: 'status_approved', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  rejected: { label: 'status_rejected', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  delivered: { label: 'status_delivered', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Truck },
}

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected', 'delivered']

export default function Dashboard() {
  const { getToken } = useAuth()
  const { t } = useLang()
  const { addToast } = useToast()
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('orders')
  const [updating, setUpdating] = useState(null)

  const loadData = useCallback(async () => {
    const token = getToken()
    if (!token) return
    setLoading(true)
    try {
      const [s, o] = await Promise.all([getDashboardStats(token), getOrders(token)])
      setStats(s)
      setOrders(o)
    } catch {
      addToast(t('error_load'), 'error')
    } finally {
      setLoading(false)
    }
  }, [getToken, addToast, t])

  useEffect(() => { loadData() }, [loadData])

  const handleStatusUpdate = async (orderId, status) => {
    const token = getToken()
    setUpdating(orderId)
    try {
      await updateOrder(orderId, status, token)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      if (stats) {
        setStats(prev => ({
          ...prev,
          pending_orders: status === 'pending' ? prev.pending_orders + 1 : prev.pending_orders - (orders.find(o=>o.id===orderId)?.status==='pending' ? 1 : 0),
        }))
      }
      addToast(`Order ${status}!`, 'success')
      loadData()
    } catch {
      addToast(t('error_load'), 'error')
    } finally {
      setUpdating(null)
    }
  }

  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchSearch = !search ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const STAT_CARDS = stats ? [
    { icon: ShoppingBag, label: t('dash_orders'), value: stats.total_orders, color: 'bg-simba-navy', iconColor: 'text-blue-300' },
    { icon: Clock, label: t('dash_pending'), value: stats.pending_orders, color: 'bg-yellow-500', iconColor: 'text-yellow-200' },
    { icon: CheckCircle, label: t('dash_approved'), value: stats.approved_orders, color: 'bg-green-600', iconColor: 'text-green-200' },
    { icon: TrendingUp, label: t('dash_revenue'), value: `RWF ${stats.total_revenue.toLocaleString()}`, color: 'bg-simba-red', iconColor: 'text-red-200' },
  ] : []

  return (
    <div className="page-enter min-h-screen pt-20 pb-28 md:pb-8 bg-gray-50 dark:bg-gray-950">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-16 bottom-0 bg-simba-navy dark:bg-gray-900 border-r border-gray-700 p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-4 border-b border-white/10 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🦁</span>
              <div>
                <p className="font-bold text-white font-heading">Simba Admin</p>
                <p className="text-white/50 text-xs">Market Rep</p>
              </div>
            </div>
          </div>
          {[
            { icon: LayoutDashboard, label: t('nav_dashboard'), id: 'overview' },
            { icon: ShoppingBag, label: t('orders_tab'), id: 'orders' },
            { icon: Package, label: t('products_tab'), id: 'products' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-medium w-full text-left ${
                tab === item.id ? 'bg-simba-red text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <div className="flex-1 lg:ml-64 p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">{t('dash_title')}</h1>
            <button onClick={loadData} disabled={loading} className="flex items-center gap-2 text-sm text-gray-500 hover:text-simba-red transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {/* Mobile tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide lg:hidden">
            {[{ id: 'orders', label: t('orders_tab') }, { id: 'products', label: t('products_tab') }].map(item => (
              <button key={item.id} onClick={() => setTab(item.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${tab === item.id ? 'bg-simba-red text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                {item.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading ? (
              Array.from({length:4}).map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl" />)
            ) : STAT_CARDS.map(({ icon: Icon, label, value, color, iconColor }) => (
              <div key={label} className={`${color} rounded-2xl p-5 text-white`}>
                <div className="flex items-start justify-between mb-3">
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <p className="font-bold text-xl font-heading leading-tight">{value}</p>
                <p className="text-white/70 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Orders tab */}
          {(tab === 'orders' || tab === 'overview') && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={t('search_orders')}
                    className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
                  {STATUS_TABS.map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`shrink-0 px-3 py-2 rounded-full text-xs font-bold transition-all ${statusFilter === s ? 'bg-simba-red text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200'}`}>
                      {s === 'all' ? t('filter_all') : t(`status_${s}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                      <th className="px-5 py-3 text-left">{t('col_id')}</th>
                      <th className="px-5 py-3 text-left">{t('col_customer')}</th>
                      <th className="px-5 py-3 text-left hidden md:table-cell">{t('col_items')}</th>
                      <th className="px-5 py-3 text-left">{t('col_total')}</th>
                      <th className="px-5 py-3 text-left">{t('col_status')}</th>
                      <th className="px-5 py-3 text-left hidden lg:table-cell">{t('col_date')}</th>
                      <th className="px-5 py-3 text-left">{t('col_actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {loading ? (
                      Array.from({length:5}).map((_,i) => (
                        <tr key={i}>
                          {Array.from({length:7}).map((_,j) => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded-full" /></td>)}
                        </tr>
                      ))
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center text-gray-400">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
                          <p>No orders found</p>
                        </td>
                      </tr>
                    ) : filteredOrders.map(order => {
                      const SC = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                      const StatusIcon = SC.icon
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                              #{order.id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{order.customer_name}</p>
                            <p className="text-xs text-gray-400">{order.customer_email}</p>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {Array.isArray(order.items) ? order.items.length : 0} items
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                              RWF {order.total?.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${SC.class}`}>
                              <StatusIcon className="w-3 h-3" />
                              {t(SC.label)}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <span className="text-xs text-gray-400">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1">
                              {order.status === 'pending' && (
                                <>
                                  <button
                                    disabled={updating === order.id}
                                    onClick={() => handleStatusUpdate(order.id, 'approved')}
                                    className="px-2.5 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors disabled:opacity-50"
                                  >
                                    {t('btn_approve')}
                                  </button>
                                  <button
                                    disabled={updating === order.id}
                                    onClick={() => handleStatusUpdate(order.id, 'rejected')}
                                    className="px-2.5 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
                                  >
                                    {t('btn_reject')}
                                  </button>
                                </>
                              )}
                              {order.status === 'approved' && (
                                <button
                                  disabled={updating === order.id}
                                  onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                  className="px-2.5 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors disabled:opacity-50"
                                >
                                  {t('btn_deliver')}
                                </button>
                              )}
                              {(order.status === 'rejected' || order.status === 'delivered') && (
                                <span className="text-xs text-gray-400 italic">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                  Showing {filteredOrders.length} of {orders.length} orders
                </div>
              )}
            </div>
          )}

          {/* Products tab placeholder */}
          {tab === 'products' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <h3 className="font-heading font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">{t('products_tab')}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {stats ? `${stats.product_count} products in the database` : t('loading')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
