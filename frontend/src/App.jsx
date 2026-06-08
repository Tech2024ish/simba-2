import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AiAssistant from './components/AiAssistant.jsx'
import { useToast } from './components/Toast.jsx'
import { useLang } from './context/LangContext.jsx'
import client from './api/client.js'

import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import MomoPayment from './pages/MomoPayment.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Reviews from './pages/Reviews.jsx'
import MyOrders from './pages/MyOrders.jsx'
import Profile from './pages/Profile.jsx'
import NotFound from './pages/NotFound.jsx'

function initDarkMode() {
  const saved = localStorage.getItem('simba_dark')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (saved === 'true' || (!saved && prefersDark)) {
    document.documentElement.classList.add('dark')
  }
}

initDarkMode()

function BackendWakeup() {
  const { addToast, removeToast } = useToast()
  const { t } = useLang()
  useEffect(() => {
    let toastId = null
    const timer = setTimeout(() => {
      toastId = addToast(t('backend_warming'), 'info', 0)
    }, 3000)
    client.get('/').then(() => {
      clearTimeout(timer)
      if (toastId) removeToast(toastId)
    }).catch(() => {
      clearTimeout(timer)
      if (toastId) removeToast(toastId)
    })
    return () => clearTimeout(timer)
  }, [addToast, removeToast])
  return null
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <BackendWakeup />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/momo-payment" element={<MomoPayment />} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <AiAssistant />
    </div>
  )
}
