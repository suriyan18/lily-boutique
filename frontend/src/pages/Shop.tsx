import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Sparkles, X, ShoppingBag, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import AIStyleAnalysis from '../components/AIStyleAnalysis';
import { apiFetch } from '../services/api';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState(10000);
  const [showSpringArrivals, setShowSpringArrivals] = useState(searchParams.get('collection') === 'spring-arrivals');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');

  useEffect(() => {
    Promise.all([
      apiFetch('/api/products'),
      apiFetch('/api/categories')
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData);
      setCategories(categoriesData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
    const q = searchParams.get('q');
    if (q !== null) {
      setSearch(q);
      setIsAiSearch(false);
    }
  }, [searchParams]);

  const filteredProducts = products.filter((p: any) => {
    const searchTerms = search.toLowerCase().split(',').map(t => t.trim()).filter(t => t !== '');
    const matchesSearch = searchTerms.length === 0 || searchTerms.some(term => 
      p.name.toLowerCase().includes(term) || 
      p.category_name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
    const matchesCategory = selectedCategory === 'all' || 
                           p.category_name.toLowerCase() === selectedCategory.toLowerCase() ||
                           p.category_name.toLowerCase().replace(' ', '-') === selectedCategory.toLowerCase();
    const matchesPrice = p.price <= priceRange;
    const matchesSpring = !showSpringArrivals || p.category_name === 'Spring Arrivals';
    const matchesColor = selectedColor === 'all' || p.colors.includes(selectedColor);
    const matchesSize = selectedSize === 'all' || p.sizes.includes(selectedSize);
    return matchesSearch && matchesCategory && matchesPrice && matchesSpring && matchesColor && matchesSize;
  });

  const handleCategoryChange = (catName: string) => {
    setSelectedCategory(catName);
    if (catName === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catName.toLowerCase().replace(' ', '-'));
    }
    setSearchParams(searchParams);
  };

  const handleSpringArrivalsChange = (checked: boolean) => {
    setShowSpringArrivals(checked);
    if (checked) {
      searchParams.set('collection', 'spring-arrivals');
    } else {
      searchParams.delete('collection');
    }
    setSearchParams(searchParams);
  };

  const handleAnalysisComplete = (keywords: string) => {
    setSearch(keywords);
    setSelectedCategory('all');
    setIsAiSearch(true);
  };

  const clearAiSearch = () => {
    setSearch('');
    setIsAiSearch(false);
  };

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Shop All</h1>
            <p className="text-gray-500">Find your perfect style from our latest collection</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <AIStyleAnalysis onAnalysisComplete={handleAnalysisComplete} />
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-brand-100 rounded-full focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (isAiSearch) setIsAiSearch(false);
                }}
              />
            </div>
          </div>
        </div>

        {isAiSearch && (
          <div className="mb-8 flex items-center justify-between bg-brand-50 p-4 rounded-2xl border border-brand-100">
            <div className="flex items-center space-x-3">
              <div className="bg-brand-600 p-2 rounded-full text-white">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">AI Style Match Results</p>
                <p className="text-xs text-gray-500">Showing products matching: <span className="italic">"{search}"</span></p>
              </div>
            </div>
            <button 
              onClick={clearAiSearch}
              className="text-gray-400 hover:text-brand-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 space-y-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Filter size={18} className="mr-2" /> Categories
              </h3>
              <div className="space-y-2">
                <button 
                  onClick={() => handleCategoryChange('all')}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory === 'all' ? 'bg-brand-600 text-white' : 'hover:bg-brand-50 text-gray-600'}`}
                >
                  All Items
                </button>
                {categories.filter((c: any) => !['Spring Arrivals', 'Summer Essentials', 'Autumn Edit'].includes(c.name)).map((cat: any) => (
                  <button 
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.name)}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${selectedCategory.toLowerCase() === cat.name.toLowerCase() || selectedCategory === cat.slug ? 'bg-brand-600 text-white' : 'hover:bg-brand-50 text-gray-600'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Sparkles size={18} className="mr-2" /> Collections
              </h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-brand-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-brand-600 rounded border-gray-300"
                    checked={showSpringArrivals}
                    onChange={(e) => handleSpringArrivalsChange(e.target.checked)}
                  />
                  <span className={`text-sm ${showSpringArrivals ? 'text-brand-600 font-bold' : 'text-gray-600'}`}>Spring Arrivals</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <SlidersHorizontal size={18} className="mr-2" /> Price Range
              </h3>
              <input 
                type="range" 
                min="0" 
                max="10000" 
                step="500"
                className="w-full accent-brand-600"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>₹0</span>
                <span>Up to ₹{priceRange}</span>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-2 h-2 rounded-full bg-brand-500 mr-2" /> Colors
              </h3>
              <div className="flex flex-wrap gap-2">
                {['all', 'Purple', 'Cream', 'Gold', 'Black', 'Red', 'Blue', 'Green', 'Pink', 'White'].map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      selectedColor === color 
                        ? 'bg-brand-600 border-brand-600 text-white' 
                        : 'bg-white border-brand-100 text-gray-600 hover:border-brand-300'
                    }`}
                  >
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-2 h-2 rounded-full bg-brand-500 mr-2" /> Sizes
              </h3>
              <div className="flex flex-wrap gap-2">
                {['all', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border transition-all ${
                      selectedSize === size 
                        ? 'bg-brand-600 border-brand-600 text-white' 
                        : 'bg-white border-brand-100 text-gray-600 hover:border-brand-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl h-96"></div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product: any) => (
                  <motion.div 
                    key={product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-brand-50"
                  >
                    <div className="relative aspect-3/4 overflow-hidden group">
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-3 px-6">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image_url: product.image_url,
                              quantity: 1,
                              size: product.sizes?.[0] || 'M',
                              color: product.colors?.[0] || 'Purple'
                            });
                          }}
                          className="w-full bg-white text-brand-600 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-brand-50 transition-all"
                        >
                          <ShoppingBag size={18} />
                          <span>Add to Cart</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image_url: product.image_url,
                              quantity: 1,
                              size: product.sizes?.[0] || 'M',
                              color: product.colors?.[0] || 'Purple'
                            });
                            navigate('/checkout');
                          }}
                          className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold flex items-center justify-center hover:bg-brand-700 transition-all shadow-lg"
                        >
                          <span>Buy Now</span>
                        </button>
                        <Link to={`/product/${product.id}`} className="text-white text-sm font-medium hover:underline">View Details</Link>
                      </div>
                    </div>
                    <Link to={`/product/${product.id}`}>
                      <div className="p-6">
                        <p className="text-xs text-brand-500 font-bold uppercase tracking-widest mb-1">{product.category_name}</p>
                        <h3 className="font-display text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                          <div className="bg-brand-50 text-brand-600 p-2 rounded-full">
                            <Plus size={18} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <button 
                  onClick={() => { setSearch(''); setSelectedCategory('all'); setPriceRange(10000); setShowSpringArrivals(false); setSelectedColor('all'); setSelectedSize('all'); }}
                  className="mt-4 text-brand-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
