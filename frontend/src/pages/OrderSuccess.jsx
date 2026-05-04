import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight, Package, ShoppingBag } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'

export default function OrderSuccess() {
  const { t } = useLang()

  return (
    <div className="page-enter min-h-screen pt-28 pb-20 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <div className="absolute -top-2 -right-2 text-4xl animate-bounce">🎉</div>
        </div>

        <div className="space-y-3">
          <h1 className="font-heading font-bold text-3xl text-gray-900 dark:text-white">
            {t('success_title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            {t('success_msg')}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-100 dark:border-green-800 text-left space-y-3">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
            <Package className="w-5 h-5" />
            {t('success_next_title')}
          </div>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span> {t('success_next_1')}</li>
            <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span> {t('success_next_2')}</li>
            <li className="flex items-start gap-2"><span className="text-green-500 font-bold mt-0.5">✓</span> {t('success_next_3')}</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link to="/my-orders" className="btn-primary flex items-center justify-center gap-2">
            <ShoppingBag className="w-5 h-5" /> {t('my_orders_title')}
          </Link>
          <Link to="/shop" className="btn-outline flex items-center justify-center gap-2">
            {t('back_shop')} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
