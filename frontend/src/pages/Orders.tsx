import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Search, ReceiptText, Truck, MapPin, CheckCircle, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Orders() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [token, navigate]);

  const fetchOrders = async () => {
    try {
      const data = await apiFetch('/api/orders');
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-brand-100 text-brand-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-500">Track and manage your recent purchases</p>
          </div>
          <Package size={48} className="text-brand-200" />
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-brand-50">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-brand-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No orders found</h3>
            <p className="text-gray-500 mb-8">It seems you haven't placed any orders yet.</p>
            <button onClick={() => navigate('/shop')} className="bg-brand-600 text-white px-8 py-3 rounded-full font-bold shadow-lg">Start Shopping</button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => (
              <motion.div 
                key={order.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl shadow-sm border border-brand-50 overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="bg-brand-50 p-3 rounded-2xl">
                        <ReceiptText className="text-brand-600" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Order ID</p>
                        <p className="font-bold text-gray-800">#{order.id?.toString().slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Placed On</p>
                        <p className="font-bold text-gray-700">{new Date(order.created_at || order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Amount</p>
                        <p className="font-bold text-brand-600">₹{order.total_amount || order.totalAmount}</p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status || 'Pending'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="flex items-center space-x-4 p-3 hover:bg-brand-50/50 rounded-2xl transition-all">
                          <img src={item.imageUrl || item.image_url} alt={item.name} className="w-16 h-20 object-cover rounded-xl shadow-sm" />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                            <p className="text-xs text-gray-500">{item.size} / {item.color}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{item.price}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tracking & Info */}
                    <div className="bg-brand-50/30 rounded-3xl p-6 space-y-6">
                      <div>
                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                          <Truck size={14} className="mr-2" /> Tracking Information
                        </h5>
                        {order.tracking_id || order.trackingId ? (
                          <div className="bg-white p-4 rounded-2xl border border-brand-100 shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">Tracking ID</p>
                            <p className="font-mono font-bold text-brand-600">{order.tracking_id || order.trackingId}</p>
                            <div className="mt-3 flex items-center text-[10px] text-emerald-600 font-bold">
                              <Clock size={12} className="mr-1" /> Estimated: 3-5 Business Days
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Tracking details will be updated soon</p>
                        )}
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                          <MapPin size={14} className="mr-2" /> Delivery Address
                        </h5>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                          {order.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50/50 border-t border-brand-50 p-4 px-8 flex justify-between items-center text-sm">
                  <div className="flex items-center text-gray-500">
                    <CheckCircle size={14} className="mr-1 text-emerald-500" />
                    <span>Payment: <span className="font-bold text-gray-700">{order.payment_method || order.paymentMethod}</span></span>
                  </div>
                  <button className="text-brand-600 font-bold hover:underline flex items-center group">
                    Need Help? <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
