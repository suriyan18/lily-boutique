import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { token, user } = useAuth();

  // Load cart from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Fetch from DB if logged in
  useEffect(() => {
    const fetchDBCart = async () => {
      if (!token) return;
      try {
        const data = await apiFetch('/api/cart');
        if (data.items?.length > 0) {
          // Merge or replace? Let's replace with DB cart as truth if it exists
          const dbItems = data.items.map((i: any) => ({
            ...i, id: i.productId || i.id
          }));
          setCart(dbItems);
        }
      } catch (err) {
        console.error("Failed to fetch cart from DB", err);
      }
    };
    fetchDBCart();
  }, [token]);

  // Sync to Storage and DB
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    const syncToDB = async () => {
      if (!token) return;
      try {
        await apiFetch('/api/cart/sync', {
          method: 'POST',
          body: JSON.stringify({ items: cart })
        });
      } catch (err) {
        console.error("Failed to sync cart to DB", err);
      }
    };

    const timeoutId = setTimeout(syncToDB, 1000); // Debounce sync
    return () => clearTimeout(timeoutId);
  }, [cart, token]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.size === item.size && i.color === item.color);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
    toast.success(`${item.name} added to cart!`);
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (item) toast(`${item.name} removed from cart`);
      return prev.filter(i => i.id !== id);
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
