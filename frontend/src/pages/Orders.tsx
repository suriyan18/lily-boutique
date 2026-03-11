import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Search, ReceiptText, Truck, MapPin, CheckCircle, ChevronRight, Clock, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Orders() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Return Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

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

  const submitReturn = async () => {
    if (!returnReason.trim()) {
      toast.error('Please provide a reason for return');
      return;
    }
    setIsSubmittingReturn(true);
    try {
      await apiFetch(`/api/orders/${selectedOrderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: returnReason })
      });
      toast.success('Return request submitted successfully');
      setReturnModalOpen(false);
      setReturnReason('');
      setSelectedOrderId(null);
      fetchOrders(); // Refresh orders to show the updated status
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit return request');
    } finally {
      setIsSubmittingReturn(false);
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

  const getReturnStatusBadge = (order: any) => {
    const status = order.return_status || order.returnStatus;
    if (!status || status === 'none') return null;
    
    switch (status) {
      case 'requested': return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 uppercase">Return Pending</span>;
      case 'approved': return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">Return Approved</span>;
      case 'rejected': return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 uppercase">Return Rejected</span>;
      default: return null;
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
    <div className="bg-cream-50 min-h-screen py-12 px-4 relative">
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
            {orders.map((order, idx) => {
              const rStatus = order.return_status || order.returnStatus;
              const canReturn = order.status === 'delivered' && (!rStatus || rStatus === 'none');
              
              return (
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
                    <div className="flex flex-wrap items-center gap-4 md:space-x-6">
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
                      {getReturnStatusBadge(order)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="flex items-center space-x-4 p-3 hover:bg-brand-50/50 rounded-2xl transition-all">
                          <img src={item.imageUrl || item.image_url} alt={item.name} className="w-16 h-20 object-cover rounded-xl shadow-sm" referrerPolicy="no-referrer" />
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
                      
                      {/* Return Action */}
                      {canReturn && (
                        <div className="pt-4 border-t border-brand-100/50">
                          <button 
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setReturnModalOpen(true);
                            }}
                            className="w-full bg-white border border-brand-200 text-brand-700 py-2 rounded-xl font-bold text-sm hover:bg-brand-50 hover:border-brand-300 transition-colors flex items-center justify-center gap-2"
                          >
                            <AlertCircle size={16} /> Request Return
                          </button>
                        </div>
                      )}
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
              );
            })}
          </div>
        )}
      </div>

      {/* Return Modal */}
      <AnimatePresence>
        {returnModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative"
            >
              <button 
                onClick={() => setReturnModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-brand-50 hover:text-brand-600 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Request Return</h3>
                    <p className="text-sm text-gray-500">Order #{selectedOrderId?.toString().slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Return</label>
                    <textarea 
                      rows={4}
                      placeholder="Please tell us why you are returning this order..."
                      className="w-full p-4 bg-brand-50/30 border border-brand-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none text-sm"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-xl flex items-start gap-3">
                    <AlertCircle size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700 leading-relaxed font-medium">
                      Return requests are subject to approval by our team. You will be notified via email once your request is processed.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => setReturnModalOpen(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitReturn}
                    disabled={isSubmittingReturn}
                    className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmittingReturn ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
