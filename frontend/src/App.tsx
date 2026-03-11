// cSpell:ignore PERIYAMARIYAMMAN KOVIL THIRUCHENGODE NAMAKKAL
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Mail } from 'lucide-react';

import StyleFinder from './pages/StyleFinder';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';

import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col font-body text-gray-900">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/style-finder" element={<StyleFinder />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </AnimatePresence>
      </main>
      <footer className="bg-white border-t border-brand-100 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex flex-col items-start space-y-4">
              <a href="/" className="flex items-center gap-3 group">
                <img 
                  src="/logo.png" 
                  alt="Lily Boutique" 
                  className="h-16 w-auto object-contain" 
                  style={{ filter: 'brightness(0) saturate(100%) invert(28%) sepia(80%) saturate(2500%) hue-rotate(248deg) brightness(95%)' }} 
                />
                <div className="flex flex-col items-start">
                  <div className="flex items-baseline gap-1 leading-none">
                    <span
                      className="font-logo text-4xl leading-none"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                    >Lily</span>
                    <span className="font-display text-lg font-extrabold text-gray-800 tracking-widest uppercase">boutique</span>
                  </div>
                </div>
              </a>
            </div>
            <p className="text-gray-500 text-sm">Elevating women's fashion with elegance and contemporary style. Your destination for high-end boutique fashion.</p>
            <div className="space-y-3 pt-2">
              <div className="flex items-start text-sm text-gray-500">
                <MapPin size={18} className="mr-2 text-brand-500 shrink-0 mt-0.5" />
                <span>74/211, RK COMPLEX, PERIYAMARIYAMMAN KOVIL ST, THIRUCHENGODE, NAMAKKAL</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Phone size={18} className="mr-2 text-brand-500 shrink-0" />
                <span>+91 72000 40250</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/shop" className="hover:text-brand-600">Shop All</a></li>
              <li><a href="/collections" className="hover:text-brand-600">Collections</a></li>
              <li><a href="/about" className="hover:text-brand-600">About Us</a></li>
              <li><a href="/contact" className="hover:text-brand-600">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/shipping" className="hover:text-brand-600">Shipping Info</a></li>
              <li><a href="/returns" className="hover:text-brand-600">Returns & Exchanges</a></li>
              <li><a href="/faq" className="hover:text-brand-600">FAQs</a></li>
              <li><a href="/size-guide" className="hover:text-brand-600">Size Guide</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Newsletter</h4>
            <p className="text-sm text-gray-500 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <div className="flex">
              <input type="email" placeholder="Email" className="flex-1 px-4 py-2 bg-brand-50 border border-brand-100 rounded-l-lg outline-none focus:ring-1 focus:ring-brand-500" />
              <button className="bg-brand-600 text-white px-4 py-2 rounded-r-lg font-bold">Join</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-brand-50 text-center text-xs text-gray-400">
          © 2026 Lily Boutique. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1f2937',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid #EDE9FE',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#8B5CF6',
                  secondary: '#fff',
                },
              },
            }}
          />
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
