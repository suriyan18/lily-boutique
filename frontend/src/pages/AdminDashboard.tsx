import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingBag, Users, BarChart3, Package, Trash2, Edit2, Plus, X as CloseIcon, Search, Filter, ArrowUpRight, ArrowDownRight, IndianRupee, ShoppingCart, Tag, Wand2 } from 'lucide-react';
import { generateProductImage } from '../services/geminiService';
import { apiFetch } from '../services/api';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', category_id: 1, stock: 10, image_url: '', description: '', sizes: ['S', 'M', 'L'], colors: ['Pink', 'Cream'], is_featured: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [genPrompt, setGenPrompt] = useState('');
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [productsData, analyticsData] = await Promise.all([
        apiFetch('/api/products'),
        apiFetch('/api/admin/analytics')
      ]);
      setProducts(productsData);
      setAnalytics(analyticsData);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct)
    });
    if (res) { // apiFetch handles error responses by throwing, so a successful response means 'res' is not null/undefined
      toast.success('Product added successfully!');
      setIsAddingProduct(false);
      fetchData();
    } else {
      toast.error('Failed to add product');
    }
  };

  const generateViaAI = async () => {
    if (!genPrompt) return;
    setIsGenerating(true);
    toast.loading('Generating AI Image...', { id: 'gen-image' });
    try {
      const url = await generateProductImage(genPrompt);
      setNewProduct({ ...newProduct, image_url: url });
      toast.success('Image generated!', { id: 'gen-image' });
    } catch (err) {
      toast.error("Failed to generate image", { id: 'gen-image' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-display text-xl font-bold text-brand-600">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'analytics', icon: BarChart3, label: 'Analytics' },
            { id: 'products', icon: Package, label: 'Products' },
            { id: 'orders', icon: ShoppingCart, label: 'Orders' },
            { id: 'users', icon: Users, label: 'Users' },
            { id: 'coupons', icon: Tag, label: 'Coupons' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${activeTab === item.id ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-600 hover:bg-brand-50'}`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900">₹{analytics.totalSales}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.orderCount}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.userCount}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Recent Orders</h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analytics.recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm">#{order.id}</td>
                      <td className="px-6 py-4">{order.user_name}</td>
                      <td className="px-6 py-4 font-bold">₹{order.total_amount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
              <button 
                onClick={() => setIsAddingProduct(true)}
                className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg hover:bg-brand-700 transition-all"
              >
                <Plus size={20} />
                <span>Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p: any) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                  <div className="aspect-square relative">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                      <button className="p-3 bg-white rounded-full text-gray-900 hover:bg-brand-600 hover:text-white transition-all"><Edit2 size={20} /></button>
                      <button className="p-3 bg-white rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20} /></button>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-brand-600 font-bold uppercase mb-1">{p.category_name}</p>
                    <h3 className="font-bold text-gray-900 mb-2">{p.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">₹{p.price}</span>
                      <span className="text-sm text-gray-500">Stock: {p.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {isAddingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
                <button onClick={() => setIsAddingProduct(false)} className="text-gray-400 hover:text-gray-600"><CloseIcon size={24} /></button>
              </div>
              <form onSubmit={handleAddProduct} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                    <input 
                      type="text" required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                      <input 
                        type="number" required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                        value={newProduct.price}
                        onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Stock</label>
                      <input 
                        type="number" required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                        value={newProduct.stock}
                        onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                      value={newProduct.description}
                      onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <input 
                          type="text" 
                          placeholder="Image URL or generate with AI"
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                          value={newProduct.image_url}
                          onChange={e => setNewProduct({...newProduct, image_url: e.target.value})}
                        />
                      </div>
                      <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 relative"> {/* Added relative here */}
                        <p className="text-xs font-bold text-brand-600 uppercase mb-2">AI Image Generator</p>
                        <div className="flex space-x-2">
                          <input 
                            type="text" 
                            placeholder="Describe the product..."
                            className="flex-1 px-4 py-2 text-sm rounded-lg border border-brand-200 outline-none"
                            value={genPrompt}
                            onChange={e => setGenPrompt(e.target.value)}
                          />
                          <button
                            onClick={generateViaAI}
                            disabled={isGenerating || !genPrompt}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-all shadow-md group"
                            title="Generate with AI"
                          >
                            {isGenerating ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Wand2 size={20} className="group-hover:rotate-12 transition-transform" />
                            )}
                          </button>
                        </div>
                      </div>
                      {newProduct.image_url && (
                        <div className="aspect-square rounded-2xl overflow-hidden border border-gray-200">
                          <img src={newProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all">
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}

function X({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
