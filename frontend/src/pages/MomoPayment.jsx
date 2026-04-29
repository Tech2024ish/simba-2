import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Smartphone, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'

export default function MomoPayment() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLang()

  const phone = location.state?.phone || '+250 7XX XXX XXX'
  const total = location.state?.total || 0

  const [status, setStatus] = useState('waiting')
  const [countdown, setCountdown] = useState(15)

  useEffect(() => {
    if (!location.state?.phone) {
      navigate('/', { replace: true })
      return
    }
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setStatus('confirmed')
          setTimeout(() => navigate('/order-success', { replace: true }), 2500)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [navigate, location.state])

  const handleConfirm = () => {
    setStatus('confirmed')
    setTimeout(() => navigate('/order-success', { replace: true }), 2500)
  }

  return (
    <div className="page-enter min-h-screen pt-28 pb-20 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {status === 'waiting' ? (
          <div className="card p-8 text-center space-y-6">
            <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Smartphone className="w-12 h-12 text-yellow-600" />
            </div>

            <div>
              <h1 className="font-heading font-bold text-2xl text-gray-900 dark:text-white mb-2">
                {t('momo_waiting_title')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {t('momo_waiting_desc')}
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-5 border border-yellow-200 dark:border-yellow-800 text-left">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('momo_sent_to')}</p>
              <p className="font-bold text-xl text-gray-900 dark:text-white mb-2">{phone}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{t('momo_amount')}</span>
                <span className="font-bold text-simba-red">RWF {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-left space-y-3">
              {[t('momo_step1'), t('momo_step2'), t('momo_step3')].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-simba-red text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-full px-4 py-2">
              <Clock className="w-4 h-4" />
              <span>{t('momo_auto_confirm')} <span className="font-bold text-gray-700 dark:text-gray-200">{countdown}s</span></span>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-base"
            >
              <CheckCircle className="w-5 h-5" /> {t('momo_confirm_btn')}
            </button>

            <div className="flex items-start gap-2 text-left bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
              <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600 dark:text-blue-400">{t('momo_confirm_hint')}</p>
            </div>
          </div>
        ) : (
          <div className="card p-10 text-center space-y-5">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-green-600 mb-2">
                {t('momo_confirmed_title')}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('momo_confirmed_desc')}</p>
            </div>
            <div className="w-8 h-8 border-2 border-simba-red border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  )
}
