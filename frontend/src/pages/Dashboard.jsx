import { useState, useEffect, useCallback } from 'react'
import { LayoutDashboard, ShoppingBag, Package, TrendingUp, Clock, CheckCircle, XCircle, Truck, Search, RefreshCw, Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useLang } from '../context/LangContext.jsx'
import { useToast } from '../components/Toast.jsx'
import { getDashboardStats } from '../api/dashboard.js'
import { getOrders, updateOrder } from '../api/orders.js'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products.js'

const DEMO_ORDERS = [
  { id: 'demo-ord-001-aaa', customer_name: 'Jean Mugisha', customer_email: 'jean@example.com', total: 12500, status: 'pending', payment_method: 'momo', address: 'KG 123 St, Kicukiro', city: 'Kigali', created_at: new Date().toISOString(), items: [{ name: 'Milk 1L', qty: 2, price: 1500 }, { name: 'Bread 400g', qty: 3, price: 2000 }, { name: 'Eggs (tray)', qty: 1, price: 4000 }] },
  { id: 'demo-ord-002-bbb', customer_name: 'Amina Uwase', customer_email: 'amina@example.com', total: 8900, status: 'approved', payment_method: 'cash', address: 'KN 5 Rd', city: 'Kigali', created_at: new Date(Date.now() - 86400000).toISOString(), items: [{ name: 'Rice 5kg', qty: 1, price: 8900 }] },
  { id: 'demo-ord-003-ccc', customer_name: 'Pierre Habimana', customer_email: 'pierre@example.com', total: 15600, status: 'delivered', payment_method: 'momo', address: 'KK 35 Ave', city: 'Kigali', created_at: new Date(Date.now() - 172800000).toISOString(), items: [{ name: 'Cooking Oil 2L', qty: 2, price: 5600 }, { name: 'Sugar 1kg', qty: 2, price: 2200 }] },
  { id: 'demo-ord-004-ddd', customer_name: 'Claudine Mukamana', customer_email: 'claudine@example.com', total: 6800, status: 'rejected', payment_method: 'card', address: 'Remera', city: 'Kigali', created_at: new Date(Date.now() - 259200000).toISOString(), items: [{ name: 'Yogurt 500ml', qty: 4, price: 1700 }] },
]
const DEMO_STATS = {
  total_orders: 156, pending_orders: 12, approved_orders: 98, total_revenue: 2847600, product_count: 552,
  top_products: [
    { name: 'Rice 5kg', qty: 45, revenue: 400500 },
    { name: 'Cooking Oil 2L', qty: 38, revenue: 212800 },
    { name: 'Milk 1L', qty: 62, revenue: 93000 },
    { name: 'Sugar 1kg', qty: 31, revenue: 68200 },
    { name: 'Bread 400g', qty: 28, revenue: 56000 },
    { name: 'Eggs (tray)', qty: 20, revenue: 80000 },
  ],
  top_categories: [
    { category: 'Food Products', revenue: 1420000 },
    { category: 'Alcoholic Drinks', revenue: 680000 },
    { category: 'Cosmetics & Personal Care', revenue: 380000 },
    { category: 'Cleaning & Sanitary', revenue: 210000 },
    { category: 'Kitchen Storage', revenue: 157600 },
  ],
}

const STATUS_CONFIG = {
  pending:   { label: 'status_pending',   class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  approved:  { label: 'status_approved',  class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',   icon: CheckCircle },
  rejected:  { label: 'status_rejected',  class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',           icon: XCircle },
  delivered: { label: 'status_delivered', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',        icon: Truck },
}
const STATUS_TABS = ['all', 'pending', 'approved', 'rejected', 'delivered']
const CATEGORIES = ['Alcoholic Drinks','Baby Products','Cleaning & Sanitary','Cosmetics & Personal Care','Food Products','General','Kitchen Storage','Kitchenware & Electronics','Pet Care','Sports & Wellness']
const EMPTY_FORM = { name: '', price: '', category: 'Food Products', unit: 'Pcs', image: '', in_stock: true }

export default function Dashboard() {
  const { getToken } = useAuth()
  const { t } = useLang()
  const { addToast } = useToast()

  const [stats, setStats]           = useState(null)
  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch]         = useState('')
  const [tab, setTab]               = useState('orders')
  const [updating, setUpdating]     = useState(null)

  // Products state
  const [products, setProducts]           = useState([])
  const [prodLoading, setProdLoading]     = useState(false)
  const [prodSearch, setProdSearch]       = useState('')
  const [showModal, setShowModal]         = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm]                   = useState(EMPTY_FORM)
  const [saving, setSaving]               = useState(false)
  const [deletingId, setDeletingId]       = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const [usingDemo, setUsingDemo] = useState(false)

  const loadData = useCallback(async () => {
    const token = await getToken()
    if (!token) return
    setLoading(true)
    try {
      const [s, o] = await Promise.all([getDashboardStats(token), getOrders(token)])
      if (o.length === 0) {
        setStats({ ...DEMO_STATS, product_count: s.product_count || DEMO_STATS.product_count })
        setOrders(DEMO_ORDERS)
        setUsingDemo(true)
      } else {
        setStats(s)
        setOrders(o)
        setUsingDemo(false)
      }
    } catch {
      addToast(t('error_load'), 'error')
    } finally {
      setLoading(false)
    }
  }, [getToken, addToast, t])

  const loadProducts = useCallback(async () => {
    setProdLoading(true)
    try {
      const data = await getProducts({ limit: 50 })
      setProducts(data.products)
    } catch {
      addToast(t('error_load'), 'error')
    } finally {
      setProdLoading(false)
    }
  }, [addToast, t])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => { if (tab === 'products') loadProducts() }, [tab, loadProducts])

  const handleStatusUpdate = async (orderId, status) => {
    const token = await getToken()
    setUpdating(orderId)
    try {
      await updateOrder(orderId, status, token)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      addToast(t('order_updated'), 'success')
      loadData()
    } catch {
      addToast(t('error_load'), 'error')
    } finally {
      setUpdating(null)
    }
  }

  const openAdd = () => { setEditingProduct(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (p) => {
    setEditingProduct(p)
    setForm({ name: p.name, price: String(p.price), category: p.category, unit: p.unit || 'Pcs', image: p.image || '', in_stock: p.in_stock ?? true })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.price) return
    const token = await getToken()
    setSaving(true)
    try {
      const payload = { ...form, price: parseFloat(form.price) }
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload, token)
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p))
        addToast(t('product_updated'), 'success')
      } else {
        const created = await createProduct(payload, token)
        setProducts(prev => [created, ...prev])
        addToast(t('product_added'), 'success')
      }
      setShowModal(false)
    } catch {
      addToast(t('error_load'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const token = await getToken()
    setDeletingId(id)
    try {
      await deleteProduct(id, token)
      setProducts(prev => prev.filter(p => p.id !== id))
      addToast(t('product_deleted'), 'success')
    } catch {
      addToast(t('error_load'), 'error')
    } finally {
      setDeletingId(null)
      setConfirmDelete(null)
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

  const filteredProducts = products.filter(p =>
    !prodSearch || p.name.toLowerCase().includes(prodSearch.toLowerCase()) || p.category.toLowerCase().includes(prodSearch.toLowerCase())
  )

  const pendingOrders = orders
    .filter((order) => order.status === 'pending')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3)

  const STAT_CARDS = stats ? [
    { icon: ShoppingBag, label: t('dash_orders'),   value: stats.total_orders,                       color: 'bg-simba-navy',  iconColor: 'text-blue-300' },
    { icon: Clock,       label: t('dash_pending'),  value: stats.pending_orders,                     color: 'bg-yellow-500',  iconColor: 'text-yellow-200' },
    { icon: CheckCircle, label: t('dash_approved'), value: stats.approved_orders,                    color: 'bg-green-600',   iconColor: 'text-green-200' },
    { icon: TrendingUp,  label: t('dash_revenue'),  value: `RWF ${stats.total_revenue?.toLocaleString()}`, color: 'bg-simba-red', iconColor: 'text-red-200' },
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
                <p className="text-white/50 text-xs">{t('dash_admin_role')}</p>
              </div>
            </div>
          </div>
          {[
            { icon: LayoutDashboard, label: t('dash_overview'), id: 'overview' },
            { icon: ShoppingBag,     label: t('orders_tab'),    id: 'orders' },
            { icon: Package,         label: t('products_tab'),  id: 'products' },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-medium w-full text-left ${tab === item.id ? 'bg-simba-red text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
              <item.icon className="w-5 h-5" />{item.label}
            </button>
          ))}
        </aside>

        {/* Main */}
        <div className="flex-1 lg:ml-64 p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">{t('dash_title')}</h1>
              {usingDemo && (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold">
                  Sample Data
                </span>
              )}
            </div>
            <button onClick={loadData} disabled={loading} className="flex items-center gap-2 text-sm text-gray-500 hover:text-simba-red transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> {t('refresh')}
            </button>
          </div>

          {/* Mobile tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide lg:hidden">
            {[{ id: 'overview', label: t('dash_overview') }, { id: 'orders', label: t('orders_tab') }, { id: 'products', label: t('products_tab') }].map(item => (
              <button key={item.id} onClick={() => setTab(item.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${tab === item.id ? 'bg-simba-red text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                {item.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading ? Array.from({length:4}).map((_,i) => <div key={i} className="skeleton h-24 rounded-2xl" />) :
              STAT_CARDS.map(({ icon: Icon, label, value, color, iconColor }) => (
                <div key={label} className={`${color} rounded-2xl p-5 text-white`}>
                  <div className="flex items-start justify-between mb-3">
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  <p className="font-bold text-xl font-heading leading-tight">{value}</p>
                  <p className="text-white/70 text-xs mt-1">{label}</p>
                </div>
              ))
            }
          </div>

          {/* ── PRODUCT STATISTICS (overview only) ── */}
          {tab === 'overview' && stats && (
            <div className="grid xl:grid-cols-2 gap-6 mb-8">
              {/* Top selling products */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white mb-4">{t('dash_top_products')}</h2>
                {(!stats.top_products || stats.top_products.length === 0) ? (
                  <p className="text-sm text-gray-400 text-center py-8">{t('dash_no_sales')}</p>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const maxQty = Math.max(...stats.top_products.map(p => p.qty), 1)
                      return stats.top_products.map((p, i) => (
                        <div key={p.name}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[60%]">
                              <span className="text-simba-red font-bold mr-2">#{i + 1}</span>{p.name}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 shrink-0 ml-2">{p.qty} {t('dash_units_sold')}</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-simba-red rounded-full transition-all duration-700"
                              style={{ width: `${Math.round((p.qty / maxQty) * 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 text-right">RWF {p.revenue.toLocaleString()}</p>
                        </div>
                      ))
                    })()}
                  </div>
                )}
              </section>

              {/* Revenue by category */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white mb-4">{t('dash_top_categories')}</h2>
                {(!stats.top_categories || stats.top_categories.length === 0) ? (
                  <p className="text-sm text-gray-400 text-center py-8">{t('dash_no_sales')}</p>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const maxRev = Math.max(...stats.top_categories.map(c => c.revenue), 1)
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500']
                      return stats.top_categories.map((c, i) => (
                        <div key={c.category}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[60%]">{c.category}</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300 shrink-0 ml-2">RWF {c.revenue.toLocaleString()}</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-700`}
                              style={{ width: `${Math.round((c.revenue / maxRev) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                )}
              </section>
            </div>
          )}

          {(tab === 'overview' || tab === 'orders') && (
            <div className="grid xl:grid-cols-[1.1fr,1.4fr] gap-6 mb-8">
              <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white">{t('dash_attention')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('dash_attention_sub')}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-bold">
                    {stats?.pending_orders ?? 0} {t('status_pending')}
                  </span>
                </div>

                {pendingOrders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 px-4 py-8 text-center text-sm text-gray-400">
                    {t('dash_pending_empty')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{order.customer_name}</p>
                            <p className="text-xs text-gray-400">#{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleString()}</p>
                          </div>
                          <span className="text-sm font-bold text-simba-red">RWF {order.total?.toLocaleString()}</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <p>{t('dash_customer_contact')}: {order.customer_email}</p>
                          <p>{t('dash_payment')}: {order.payment_method}</p>
                          <p>{t('dash_delivery')}: {order.address}, {order.city}</p>
                          <p>{Array.isArray(order.items) ? order.items.length : 0} {t('items_count')}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            disabled={updating === order.id}
                            onClick={() => handleStatusUpdate(order.id, 'approved')}
                            className="px-3 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-xl text-xs font-bold hover:bg-green-200 transition-colors disabled:opacity-50"
                          >
                            {t('btn_approve')}
                          </button>
                          <button
                            disabled={updating === order.id}
                            onClick={() => handleStatusUpdate(order.id, 'rejected')}
                            className="px-3 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            {t('btn_reject')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                <div className="mb-4">
                  <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white">{t('dash_recent_orders')}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('dash_recent_sub')}</p>
                </div>
                <div className="space-y-3">
                  {orders.slice(0, 4).map((order) => {
                    const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                    const Icon = config.icon
                    return (
                      <div key={order.id} className="rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{order.customer_name}</p>
                            <p className="text-xs text-gray-400">{order.customer_email}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.class}`}>
                            <Icon className="w-3 h-3" />{t(config.label)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>#{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}</span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{Array.isArray(order.items) ? order.items.length : 0} {t('items_count')} • RWF {order.total?.toLocaleString()}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-4 text-xs text-gray-400">{t('dash_actions_hint')}</p>
              </section>
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {(tab === 'orders' || tab === 'overview') && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={t('search_orders')}
                    className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200" />
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
                    {loading ? Array.from({length:5}).map((_,i) => (
                      <tr key={i}>{Array.from({length:7}).map((_,j) => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded-full" /></td>)}</tr>
                    )) : filteredOrders.length === 0 ? (
                      <tr><td colSpan={7} className="px-5 py-16 text-center text-gray-400">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
                        <p>{t('no_orders')}</p>
                      </td></tr>
                    ) : filteredOrders.map(order => {
                      const SC = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                      const StatusIcon = SC.icon
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                          <td className="px-5 py-4"><span className="text-xs font-mono text-gray-500 dark:text-gray-400">#{order.id.slice(0,8)}</span></td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-sm text-gray-800 dark:text-gray-200">{order.customer_name}</p>
                            <p className="text-xs text-gray-400">{order.customer_email}</p>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{Array.isArray(order.items) ? order.items.length : 0} {t('items_count')}</span>
                          </td>
                          <td className="px-5 py-4"><span className="font-bold text-sm text-gray-800 dark:text-gray-200">RWF {order.total?.toLocaleString()}</span></td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${SC.class}`}>
                              <StatusIcon className="w-3 h-3" />{t(SC.label)}
                            </span>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell"><span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span></td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1">
                              {order.status === 'pending' && (<>
                                <button disabled={updating === order.id} onClick={() => handleStatusUpdate(order.id, 'approved')}
                                  className="px-2.5 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors disabled:opacity-50">
                                  {t('btn_approve')}
                                </button>
                                <button disabled={updating === order.id} onClick={() => handleStatusUpdate(order.id, 'rejected')}
                                  className="px-2.5 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors disabled:opacity-50">
                                  {t('btn_reject')}
                                </button>
                              </>)}
                              {order.status === 'approved' && (
                                <button disabled={updating === order.id} onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                  className="px-2.5 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors disabled:opacity-50">
                                  {t('btn_deliver')}
                                </button>
                              )}
                              {(order.status === 'rejected' || order.status === 'delivered') && <span className="text-xs text-gray-400 italic">—</span>}
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
                  {t('orders_showing')} {filteredOrders.length} {t('orders_of')} {orders.length} {t('orders_orders')}
                </div>
              )}
            </div>
          )}

          {/* ── PRODUCTS TAB ── */}
          {tab === 'products' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              {/* Toolbar */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={prodSearch} onChange={e => setProdSearch(e.target.value)}
                    placeholder={t('search_products')}
                    className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200" />
                </div>
                <button onClick={openAdd}
                  className="flex items-center gap-2 bg-simba-red text-white px-4 py-2.5 rounded-full text-sm font-bold hover:bg-red-700 transition-colors shrink-0">
                  <Plus className="w-4 h-4" /> {t('dash_add_product_cta')}
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                      <th className="px-5 py-3 text-left">{t('product_col_product')}</th>
                      <th className="px-5 py-3 text-left hidden md:table-cell">{t('product_col_category')}</th>
                      <th className="px-5 py-3 text-left">{t('product_col_price')}</th>
                      <th className="px-5 py-3 text-left hidden sm:table-cell">{t('product_col_unit')}</th>
                      <th className="px-5 py-3 text-left">{t('product_col_status')}</th>
                      <th className="px-5 py-3 text-left">{t('product_col_actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {prodLoading ? Array.from({length:6}).map((_,i) => (
                      <tr key={i}>{Array.from({length:6}).map((_,j) => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded-full" /></td>)}</tr>
                    )) : filteredProducts.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
                        <p>{t('no_products')}</p>
                      </td></tr>
                    ) : filteredProducts.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.image && !p.image.includes('placehold') ? p.image : `https://picsum.photos/seed/simba-${p.id}/40/40`}
                              alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0 bg-gray-100" />
                            <div>
                              <p className="font-medium text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{p.name}</p>
                              <p className="text-xs text-gray-400">#{p.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">{p.category}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-bold text-sm text-simba-red">RWF {p.price?.toLocaleString()}</span>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{p.unit}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${p.in_stock ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.in_stock ? 'bg-green-500' : 'bg-red-500'}`} />
                            {p.in_stock ? t('in_stock') : t('out_stock')}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(p)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setConfirmDelete(p)}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                  {t('products_showing')} {filteredProducts.length} {t('products_of')} {products.length} {t('products_items')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white">
                {editingProduct ? t('edit_product') : t('add_product')}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('product_name')} *</label>
                <input required type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('price_label')} *</label>
                  <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('product_col_unit')}</label>
                  <input type="text" value={form.unit} onChange={e => setForm(f => ({...f, unit: e.target.value}))}
                    placeholder="Pcs, Kg, L..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('category_label')}</label>
                <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('image_url')}</label>
                <input type="url" value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:border-simba-red focus:outline-none text-sm text-gray-800 dark:text-gray-200" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-11 h-6 rounded-full transition-colors ${form.in_stock ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  onClick={() => setForm(f => ({...f, in_stock: !f.in_stock}))}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.in_stock ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('in_stock_toggle')}</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {t('cancel')}
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-simba-red text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingProduct ? t('save_changes') : t('add_product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-simba-red" />
            </div>
            <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white mb-2">{t('delete_product_title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              "<span className="font-medium text-gray-700 dark:text-gray-300">{confirmDelete.name}</span>" {t('delete_confirm_msg')}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">
                {t('cancel')}
              </button>
              <button onClick={() => handleDelete(confirmDelete.id)} disabled={deletingId === confirmDelete.id}
                className="flex-1 px-4 py-2.5 bg-simba-red text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50">
                {deletingId === confirmDelete.id ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
