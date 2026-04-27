import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('simba_cart') || '[]')
    } catch {
      return []
    }
  })
  const [cartBounce, setCartBounce] = useState(false)

  useEffect(() => {
    localStorage.setItem('simba_cart', JSON.stringify(items))
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
