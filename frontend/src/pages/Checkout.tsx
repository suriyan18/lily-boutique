// cSpell:ignore Netbanking pincode
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Shield, ArrowRight, ChevronLeft, MapPin, Phone, User, CheckCircle, Smartphone, Package, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../services/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  
  // Form State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  
  const [address, setAddress] = useState({ 
    fullName: '',
    street: '', 
    city: '', 
    state: '', 
    zip: '', 
    landmark: '' 
  });
  
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [orderResult, setOrderResult] = useState<{orderId: string, trackingId: string} | null>(null);
  
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error("Please login to proceed to checkout");
      navigate('/login?redirect=checkout');
      return;
    }
    if (cart.length === 0 && step !== 4) {
      navigate('/shop');
    }
    
    // Fetch saved addresses
    const fetchAddresses = async () => {
      try {
        const data = await apiFetch('/api/addresses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedAddresses(data);
        if (data.length > 0) {
          setUseSavedAddress(true);
          setSelectedAddressId(data[0]._id || data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch addresses", err);
        toast.error("Failed to load saved addresses.");
      }
    };
    if (step === 2) fetchAddresses();
  }, [cart, step, navigate, user, token]);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) return toast.error("Please enter a valid phone number");
    setIsProcessing(true);
    try {
      await apiFetch('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone })
      });
      setOtpSent(true);
      toast.success("OTP sent to your phone!");
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return toast.error("Please enter the OTP");
    setIsProcessing(true);
    try {
      await apiFetch('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp })
      });
      setIsOtpVerified(true);
      setStep(2);
      toast.success("Phone verified!");
    } catch (err) {
      toast.error("Invalid OTP");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    let finalAddress = "";
    let finalAddressId = null;

    if (useSavedAddress && selectedAddressId) {
      const addr = savedAddresses.find(a => (a._id || a.id).toString() === selectedAddressId.toString());
      if (addr) {
        finalAddress = `${addr.addressLine}, ${addr.landmark ? addr.landmark + ', ' : ''}${addr.city}, ${addr.state} - ${addr.pincode}`;
        finalAddressId = selectedAddressId;
      }
    } else {
      finalAddress = `${address.street}, ${address.landmark ? address.landmark + ', ' : ''}${address.city}, ${address.state} - ${address.zip}`;
      // Save new address optionally? User schema says they can have many.
      // For now we just pass it to checkout.
    }

    // Simulate Payment Gateway delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const checkoutData = await apiFetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          address: finalAddress,
          addressId: finalAddressId,
          payment_method: paymentMethod,
          phone,
          fullName: address.fullName || (useSavedAddress ? savedAddresses.find(a => (a._id || a.id).toString() === selectedAddressId?.toString())?.fullName : '')
        })
      });
      
      setPaymentStatus('success');
      setOrderResult({ orderId: checkoutData.orderId, trackingId: checkoutData.trackingId });
      setStep(4);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (err: any) {
      setPaymentStatus('failed');
      toast.error(err.message || "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { title: 'Verify', icon: <Shield size={18} /> },
    { title: 'Address', icon: <MapPin size={18} /> },
    { title: 'Payment', icon: <CreditCard size={18} /> },
    { title: 'Done', icon: <CheckCircle size={18} /> },
  ];

  return (
    <div className="bg-cream-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto relative px-4">
          <div className="absolute top-5 left-8 right-8 h-1 bg-brand-100 -z-10" />
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all relative z-10 ${step >= i + 1 ? 'bg-brand-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-brand-100'}`}>
                {step > i + 1 ? <CheckCircle size={20} /> : i + 1}
              </div>
              <span className={`text-xs mt-2 font-bold ${step >= i + 1 ? 'text-brand-600' : 'text-gray-400'}`}>{s.title}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-brand-50"
                >
                  <h2 className="font-display text-2xl font-bold mb-8 flex items-center">
                    <Phone className="mr-2 text-brand-600" /> Verify Phone Number
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">+91</span>
                        <input 
                          type="tel" 
                          disabled={otpSent}
                          className="w-full pl-14 pr-4 py-4 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-500 outline-none disabled:bg-gray-50"
                          placeholder="98765 43210"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        />
                      </div>
                    </div>

                    {otpSent && !isOtpVerified && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Enter OTP</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-4 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-500 outline-none text-center text-2xl tracking-[1em] font-bold"
                          placeholder="000000"
                          value={otp}
                          onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">Check your terminal for the simulated OTP</p>
                      </motion.div>
                    )}

                    <button 
                      onClick={otpSent ? handleVerifyOTP : handleSendOTP}
                      disabled={isProcessing || phone.length < 10}
                      className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isProcessing ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : (
                        <>
                          <span>{otpSent ? 'Verify OTP' : 'Send Verification Code'}</span>
                          {!otpSent && <ArrowRight size={20} />}
                        </>
                      )}
                    </button>
                    {otpSent && <button onClick={() => setOtpSent(false)} className="w-full text-brand-600 font-bold text-sm">Change Number</button>}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-brand-50"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="font-display text-2xl font-bold flex items-center">
                      <MapPin className="mr-2 text-brand-600" /> Shipping Address
                    </h2>
                    <button onClick={() => setStep(1)} className="text-gray-400 hover:text-brand-600 flex items-center text-sm font-bold">
                      <ChevronLeft size={16} /> Back
                    </button>
                  </div>

                  {savedAddresses.length > 0 && (
                    <div className="mb-10 space-y-4">
                      <div className="flex space-x-4 mb-6">
                        <button 
                          onClick={() => setUseSavedAddress(true)}
                          className={`flex-1 py-3 px-4 rounded-xl font-bold border-2 transition-all ${useSavedAddress ? 'bg-brand-50 border-brand-600 text-brand-600' : 'bg-white border-brand-100 text-gray-500 hover:border-brand-200'}`}
                        >
                          Saved Addresses
                        </button>
                        <button 
                          onClick={() => setUseSavedAddress(false)}
                          className={`flex-1 py-3 px-4 rounded-xl font-bold border-2 transition-all ${!useSavedAddress ? 'bg-brand-50 border-brand-600 text-brand-600' : 'bg-white border-brand-100 text-gray-500 hover:border-brand-200'}`}
                        >
                          Add New
                        </button>
                      </div>

                      {useSavedAddress && (
                        <div className="grid grid-cols-1 gap-4">
                          {savedAddresses.map((addr) => (
                            <div 
                              key={addr._id || addr.id}
                              onClick={() => setSelectedAddressId(addr._id || addr.id)}
                              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === (addr._id || addr.id) ? 'border-brand-600 bg-brand-50/50' : 'border-brand-50 hover:border-brand-200'}`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-gray-900">{addr.fullName}</p>
                                  <p className="text-sm text-gray-600 mt-1">{addr.addressLine}, {addr.landmark && addr.landmark + ', '} {addr.city}</p>
                                  <p className="text-sm text-gray-600">{addr.state} - {addr.pincode}</p>
                                  <p className="text-sm font-bold text-brand-600 mt-2">{addr.phone}</p>
                                </div>
                                {selectedAddressId === (addr._id || addr.id) && <CheckCircle className="text-brand-600" size={20} />}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!useSavedAddress && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-500 outline-none"
                          value={address.fullName}
                          onChange={e => setAddress({...address, fullName: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                        <input 
                          type="text" 
                          placeholder="House No, Building Name, Area"
                          className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-500 outline-none"
                          value={address.street}
                          onChange={e => setAddress({...address, street: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Landmark (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Near Apollo Hospital"
                          className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-500 outline-none"
                          value={address.landmark}
                          onChange={e => setAddress({...address, landmark: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-500 outline-none"
                          value={address.city}
                          onChange={e => setAddress({...address, city: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">ZIP Code</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 rounded-xl border border-brand-100 focus:ring-2 focus:ring-brand-500 outline-none"
                          value={address.zip}
                          onChange={e => setAddress({...address, zip: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => setStep(3)}
                    disabled={!useSavedAddress && (!address.street || !address.city || !address.zip)}
                    className="w-full mt-10 bg-brand-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all disabled:opacity-50"
                  >
                    Continue to Payment
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white p-8 rounded-3xl shadow-sm border border-brand-50"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="font-display text-2xl font-bold flex items-center">
                      <CreditCard className="mr-2 text-brand-600" /> Payment Selection
                    </h2>
                    <button onClick={() => setStep(2)} className="text-gray-400 hover:text-brand-600 flex items-center text-sm font-bold">
                      <ChevronLeft size={16} /> Back
                    </button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { id: 'COD', label: 'Cash on Delivery', sub: 'Pay when you receive' },
                      { id: 'UPI', label: 'UPI Payment', sub: 'Instant transfer via GooglePay/PhonePe' },
                      { id: 'Razorpay', label: 'Online Payment (Card/Netbanking)', sub: 'Secure checkout with Razorpay' }
                    ].map(method => (
                      <label key={method.id} className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-brand-600 bg-brand-50' : 'border-brand-50 hover:border-brand-200'}`}>
                        <input 
                          type="radio" 
                          name="payment" 
                          className="hidden" 
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                        />
                        <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === method.id ? 'border-brand-600' : 'border-gray-300'}`}>
                          {paymentMethod === method.id && <div className="w-3 h-3 bg-brand-600 rounded-full" />}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{method.label}</div>
                          <div className="text-xs text-gray-500">{method.sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  <button 
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className={`w-full mt-10 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 ${
                      paymentStatus === 'success' ? 'bg-emerald-600' : 
                      paymentStatus === 'failed' ? 'bg-red-600' : 'bg-brand-600 hover:bg-brand-700'
                    }`}
                  >
                    {paymentStatus === 'processing' ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        <span>Verifying Payment...</span>
                      </>
                    ) : paymentStatus === 'success' ? (
                      <>
                        <CheckCircle size={20} />
                        <span>Payment Successful</span>
                      </>
                    ) : paymentStatus === 'failed' ? (
                      <>
                        <X size={20} />
                        <span>Payment Failed - Try Again</span>
                      </>
                    ) : (
                      <span>Pay ₹{total > 2999 ? total : total + 150}</span>
                    )}
                  </button>
                </motion.div>
              )}

              {step === 4 && orderResult && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-10 rounded-3xl shadow-xl border border-brand-100 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                  <p className="text-gray-500 mb-8">Your order has been successfully placed.</p>
                  
                  <div className="bg-brand-50/50 rounded-2xl p-6 mb-8 grid grid-cols-2 gap-4 text-left">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Order ID</p>
                      <p className="font-bold text-gray-800">#{orderResult.orderId.toString().slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Tracking ID</p>
                      <p className="font-bold text-brand-600">{orderResult.trackingId}</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-brand-100/50 flex items-center">
                      <Truck size={16} className="text-brand-500 mr-2" />
                      <p className="text-xs font-bold text-gray-600">Expected delivery in 3-5 business days</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => navigate('/shop')}
                      className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                      Shop More
                    </button>
                    <button 
                      onClick={() => navigate('/orders')}
                      className="flex-1 px-8 py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all flex items-center justify-center"
                    >
                      <Package size={20} className="mr-2" />
                      Track Order
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-brand-50 shadow-sm sticky top-24">
              <h3 className="font-display text-xl font-bold mb-6">Order Summary</h3>
              <div className="max-h-60 overflow-y-auto mb-6 pr-2 -mr-2 scrollbar-thin scrollbar-thumb-brand-100">
                {cart.map(item => (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{item.size} / {item.color}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                        <span className="font-bold text-sm">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 pt-6 border-t border-brand-50">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">₹{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-bold text-emerald-600">{total > 2999 ? 'FREE' : '₹150'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-brand-50 mt-3">
                  <span>Total</span>
                  <span className="text-brand-600">₹{total > 2999 ? total : total + 150}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
