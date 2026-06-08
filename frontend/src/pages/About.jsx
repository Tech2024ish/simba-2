import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, Package, Star, Clock } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'

export default function About() {
  const { t } = useLang()

  return (
    <div className="page-enter min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="bg-simba-light py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-5xl mb-4 block">🦁</span>
          <p className="text-simba-orange font-bold uppercase tracking-widest text-sm mb-3">{t('about_sub')}</p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-simba-navy mb-6">{t('about_title')}</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('about_desc')}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-gray-900 py-12 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: MapPin,   value: '10+',  label: t('our_branches') },
            { icon: Package,  value: '552',  label: t('dash_products') },
            { icon: Star,     value: '4.8',  label: 'Customer Rating' },
            { icon: Clock,    value: '7AM–10PM', label: t('contact_hours').split(':')[0] },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-800">
              <Icon className="w-7 h-7 text-simba-red mb-3" />
              <p className="font-heading font-bold text-3xl text-simba-red">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading font-bold text-3xl text-gray-900 dark:text-white mb-4">{t('about_mission')}</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg mb-6">{t('about_mission_desc')}</p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/shop" className="btn-primary flex items-center gap-2">
                {t('hero_cta')} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="border-2 border-simba-red text-simba-red px-6 py-2.5 rounded-full font-bold text-sm hover:bg-simba-red hover:text-white transition-colors">
                {t('nav_contact')}
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { emoji: '🥦', title: 'Fresh & Quality', desc: 'Carefully selected fresh produce and quality products every day.' },
              { emoji: '💰', title: 'Affordable Prices', desc: 'Competitive pricing to ensure every family can shop with us.' },
              { emoji: '📍', title: 'Convenient Locations', desc: '10+ branches across Kigali and beyond, always close to you.' },
              { emoji: '🚀', title: 'Fast Delivery', desc: 'Same-day delivery available across Kigali.' },
            ].map(item => (
              <div key={item.title} className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                <span className="text-2xl shrink-0">{item.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{item.title}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="bg-simba-navy py-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-heading font-bold text-2xl text-white mb-2">{t('stores_title')}</h2>
          <p className="text-white/60 mb-8">{t('stores_sub')}</p>
          <Link to="/#stores" className="inline-flex items-center gap-2 bg-simba-orange text-white font-bold px-6 py-3 rounded-full hover:bg-orange-500 transition-colors">
            <MapPin className="w-4 h-4" /> {t('stores_directions')}
          </Link>
        </div>
      </section>
    </div>
  )
}
