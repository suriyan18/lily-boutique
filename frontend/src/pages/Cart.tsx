import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-cream-50 px-4">
        <div className="bg-white p-12 rounded-3xl shadow-sm text-center max-w-md border border-brand-50">
          <div className="bg-brand-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-brand-600" />
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/shop" className="inline-flex items-center px-8 py-4 bg-brand-600 text-white rounded-full font-bold hover:bg-brand-700 transition-all shadow-lg">
            Start Shopping <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-12">Your Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <motion.div 
                key={`${item.id}-${item.size}-${item.color}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-brand-50 flex flex-col sm:flex-row items-center gap-6"
              >
                <div className="w-24 h-32 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Size: <span className="font-bold text-brand-600">{item.size}</span> | 
                    Color: <span className="font-bold text-brand-600">{item.color}</span>
                  </p>
                  <div className="flex items-center justify-center sm:justify-start space-x-4">
                    <div className="flex items-center border border-brand-100 rounded-full">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-3 py-1 text-gray-600 hover:text-brand-600"
                      >
                        -
                      </button>
                      <span className="px-3 font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:text-brand-600"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="text-center sm:text-right w-full sm:w-auto mt-4 sm:mt-0">
                  <p className="text-xl font-bold text-gray-900">₹{item.price * item.quantity}</p>
                  <p className="text-xs text-gray-400">₹{item.price} each</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-50 sticky top-24">
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-6">Order Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold">{total > 2999 ? 'FREE' : '₹150'}</span>
                </div>
                <div className="pt-4 border-t border-brand-50 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{total > 2999 ? total : total + 150}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Coupon Code"
                    className="w-full pl-4 pr-20 py-3 bg-brand-50/50 border border-brand-100 rounded-full focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-600 font-bold text-sm">Apply</button>
                </div>
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-brand-600 text-white py-4 rounded-full font-bold hover:bg-brand-700 transition-all shadow-lg flex items-center justify-center"
                >
                  Proceed to Checkout <ArrowRight className="ml-2" size={20} />
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center space-x-4 grayscale opacity-50">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="Paypal" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
