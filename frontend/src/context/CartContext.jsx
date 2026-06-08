import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

const GUEST_KEY = 'simba_cart_guest'
const keyFor = (userId) => (userId ? `simba_cart_${userId}` : GUEST_KEY)

const loadCart = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(keyFor(userId)) || '[]')
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id || null
  const [items, setItems] = useState(() => loadCart(userId))
  const [cartBounce, setCartBounce] = useState(false)
  const activeUserId = useRef(userId)

  // Reload the right cart whenever the logged-in user changes (login/logout/switch account)
  useEffect(() => {
    if (activeUserId.current !== userId) {
      activeUserId.current = userId
      setItems(loadCart(userId))
    }
  }, [userId])

  useEffect(() => {
    localStorage.setItem(keyFor(activeUserId.current), JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { ...product, qty }]
    })
    setCartBounce(true)
    setTimeout(() => setCartBounce(false), 400)
  }, [])

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count, cartBounce }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
