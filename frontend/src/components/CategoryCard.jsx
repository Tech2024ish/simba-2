import { useNavigate } from 'react-router-dom'

const CATEGORY_ICONS = {
  "Alcoholic Drinks": "🍷",
  "Baby Products": "🍼",
  "Cleaning & Sanitary": "🧹",
  "Cosmetics & Personal Care": "💄",
  "Food Products": "🥗",
  "General": "🛒",
  "Kitchen Storage": "🗄️",
  "Kitchenware & Electronics": "🍳",
  "Pet Care": "🐾",
  "Sports & Wellness": "💪"
}

const CATEGORY_COLORS = {
  "Alcoholic Drinks": "from-purple-500 to-purple-700",
  "Baby Products": "from-pink-400 to-pink-600",
  "Cleaning & Sanitary": "from-blue-400 to-blue-600",
  "Cosmetics & Personal Care": "from-rose-400 to-rose-600",
  "Food Products": "from-green-500 to-green-700",
  "General": "from-simba-navy to-blue-800",
  "Kitchen Storage": "from-amber-500 to-amber-700",
  "Kitchenware & Electronics": "from-orange-500 to-orange-700",
  "Pet Care": "from-teal-500 to-teal-700",
  "Sports & Wellness": "from-red-500 to-red-700"
}

export default function CategoryCard({ category }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/shop?category=${encodeURIComponent(category.name)}`)}
      className={`bg-gradient-to-br ${CATEGORY_COLORS[category.name] || 'from-gray-500 to-gray-700'} rounded-2xl p-5 text-white text-left hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group w-full`}
    >
      <div className="text-3xl mb-3">{CATEGORY_ICONS[category.name] || '🛒'}</div>
      <h3 className="font-bold font-heading text-sm leading-tight">{category.name}</h3>
      <p className="text-white/70 text-xs mt-1">{category.count} products</p>
    </button>
  )
}
