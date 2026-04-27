import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'

export default function Footer() {
  const { t } = useLang()

  return (
    <footer className="bg-simba-navy dark:bg-gray-950 text-white mt-20 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🦁</span>
              <span className="font-heading font-bold text-xl text-simba-orange">Simba</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Rwanda's #1 Online Supermarket. Fresh groceries delivered fast to your door in Kigali.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-simba-orange transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold mb-4 text-simba-orange">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: t('nav_home'), to: '/' },
                { label: t('nav_shop'), to: '/shop' },
                { label: t('nav_cart'), to: '/cart' },
                { label: t('nav_login'), to: '/login' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/60 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-bold mb-4 text-simba-orange">Categories</h4>
            <ul className="space-y-2.5">
              {['Food Products', 'Alcoholic Drinks', 'Cosmetics & Personal Care', 'Baby Products', 'Kitchenware & Electronics'].map(cat => (
                <li key={cat}>
                  <Link to={`/shop?category=${encodeURIComponent(cat)}`} className="text-white/60 hover:text-white text-sm transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold mb-4 text-simba-orange">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <MapPin className="w-4 h-4 text-simba-orange shrink-0 mt-0.5" />
                Kigali, Rwanda
              </li>
              <li className="flex items-center gap-2 text-white/60 text-sm">
                <Phone className="w-4 h-4 text-simba-orange shrink-0" />
                +250 700 000 000
              </li>
              <li className="flex items-center gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4 text-simba-orange shrink-0" />
                info@simbasupermarket.rw
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-xs">
          <p>© 2024 Simba Supermarket. All rights reserved.</p>
          <p>Built with ❤️ in Kigali, Rwanda</p>
        </div>
      </div>
    </footer>
  )
}
