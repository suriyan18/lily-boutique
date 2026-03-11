import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Heart, Search, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden p-2 text-gray-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="shrink-0 flex items-center gap-1 sm:gap-3 group">
                <img src="/logo.png" alt="Lily Boutique" className="h-10 sm:h-16 lg:h-20 w-auto object-contain" style={{ filter: 'brightness(0) saturate(100%) invert(28%) sepia(80%) saturate(2500%) hue-rotate(248deg) brightness(95%)' }} />
                <div className="flex flex-col items-start">
                  <div className="flex items-baseline gap-1 leading-none">
                    <span
                      className="font-logo text-3xl sm:text-4xl leading-none"
                      style={{ background: 'linear-gradient(135deg, #7C3AED, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                    >Lily</span>
                    <span className="font-display text-xs sm:text-lg font-extrabold text-gray-800 tracking-widest uppercase">boutique</span>
                  </div>
                  <span
                    className="font-logo text-[10px] sm:text-[13px] tracking-wide mt-0.5 transition-all duration-300 group-hover:tracking-widest"
                    style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  >✦ Style With Smile...</span>
                </div>
              </Link>
          </div>

          <nav className="hidden sm:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Home</Link>
            <Link to="/shop" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">Shop</Link>
            <Link to="/style-finder" className="text-gray-600 hover:text-brand-600 font-medium transition-colors flex items-center">
              <Sparkles size={16} className="mr-1 text-brand-500" /> Style Finder
            </Link>
          </nav>

          <div className="flex items-center space-x-4 relative">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 hover:text-brand-600 transition-colors"
            >
              <Search size={20} />
            </button>
            <Link to="/wishlist" className="p-2 text-gray-600 hover:text-brand-600 transition-colors">
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="p-2 text-gray-600 hover:text-brand-600 transition-colors relative">
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {cart.length}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-1 p-2 text-gray-600 hover:text-brand-600 transition-colors">
                  <User size={20} />
                  <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
                </button>
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white border border-brand-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50">My Orders</Link>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50">Profile</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 font-bold">Admin Dashboard</Link>
                  )}
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-brand-600 hover:bg-brand-700 transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Global Search Bar Dropdown */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-brand-100 py-4 px-4 shadow-lg flex justify-center z-50">
          <form 
            onSubmit={handleSearchSubmit}
            className="w-full max-w-2xl relative"
          >
            <input 
              type="text"
              autoFocus
              placeholder="Search products, categories, or collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white border-b border-brand-100 py-4 px-4 space-y-4">
          <Link to="/" className="block text-gray-600 hover:text-brand-600 font-medium">Home</Link>
          <Link to="/shop" className="block text-gray-600 hover:text-brand-600 font-medium">Shop</Link>
          <Link to="/collections" className="block text-gray-600 hover:text-brand-600 font-medium">Collections</Link>
          {!user && <Link to="/login" className="block text-brand-600 font-bold">Login / Register</Link>}
        </div>
      )}
    </header>
  );
}
