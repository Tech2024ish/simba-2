import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import { useLang } from '../context/LangContext.jsx'

const SocialIcons = {
  Facebook: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  Instagram: () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
}

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
              {[SocialIcons.Facebook, SocialIcons.X, SocialIcons.Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-simba-orange transition-colors">
                  <Icon />
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

          {/* Branches */}
          <div>
            <h4 className="font-heading font-bold mb-4 text-simba-orange">Our Branches</h4>
            <ul className="space-y-2">
              {['City Center (UTC)','KN 5 Road','Kimironko','Nyamirambo','Remera','Gisenyi'].map(b => (
                <li key={b} className="flex items-center gap-2 text-white/60 text-sm">
                  <MapPin className="w-3.5 h-3.5 text-simba-orange shrink-0" />
                  {b}
                </li>
              ))}
              <li className="text-white/40 text-xs mt-1 pl-5">+ 4 more locations</li>
            </ul>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Phone className="w-3.5 h-3.5 text-simba-orange shrink-0" />
                +250 700 000 000
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Mail className="w-3.5 h-3.5 text-simba-orange shrink-0" />
                info@simbasupermarket.rw
              </div>
            </div>
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
