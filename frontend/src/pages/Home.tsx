// cSpell:ignore Workwear workwear florals PERIYAMARIYAMMAN KOVIL THIRUCHENGODE NAMAKKAL
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Star, Instagram, Truck, RotateCcw, ShieldCheck, ShoppingBag, X, MapPin, Phone, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../services/api';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [quickAddProduct, setQuickAddProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    apiFetch('/api/products')
      .then(data => setFeaturedProducts(data.slice(0, 4)));
  }, []);

  return (
    <div className="bg-cream-50">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
            alt="Fashion Hero"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-r from-brand-900/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Elegance in <br />
              <span className="text-brand-200">Every Stitch</span>
            </h1>
            <p className="font-logo text-2xl text-brand-200 mb-4">Style With Smile...</p>
            <p className="text-lg text-white/90 mb-8 font-body">
              Discover our curated collection of contemporary women's fashion. Designed for the modern woman who values style and comfort.
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center px-8 py-4 bg-brand-600 text-white rounded-full font-bold hover:bg-brand-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Shop Collection <ArrowRight className="ml-2" size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b border-brand-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center space-x-4 p-6 rounded-2xl bg-brand-50/50">
            <div className="bg-brand-100 p-3 rounded-full text-brand-600"><Truck size={24} /></div>
            <div>
              <h3 className="font-bold text-gray-900">Free Shipping</h3>
              <p className="text-sm text-gray-500">On orders over ₹2999</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-6 rounded-2xl bg-brand-50/50">
            <div className="bg-brand-100 p-3 rounded-full text-brand-600"><RotateCcw size={24} /></div>
            <div>
              <h3 className="font-bold text-gray-900">7-Day Returns</h3>
              <p className="text-sm text-gray-500">Hassle-free return policy</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-6 rounded-2xl bg-brand-50/50">
            <div className="bg-brand-100 p-3 rounded-full text-brand-600"><ShieldCheck size={24} /></div>
            <div>
              <h3 className="font-bold text-gray-900">Secure Payment</h3>
              <p className="text-sm text-gray-500">100% secure checkout</p>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Shop by Collection</h2>
              <p className="text-gray-500">Discover our curated categories for every occasion</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => scroll('left')}
                className="p-3 rounded-full border border-brand-100 text-gray-400 hover:text-brand-600 hover:border-brand-600 transition-all"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="p-3 rounded-full border border-brand-100 text-gray-400 hover:text-brand-600 hover:border-brand-600 transition-all"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div 
            ref={scrollContainerRef}
            className="flex space-x-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[
              { 
                name: 'Sarees', 
                description: 'Exquisite silk and designer sarees for every occasion.',
                image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', 
                slug: 'sarees' 
              },
              { 
                name: 'Kids Wear', 
                description: 'Adorable and comfortable styles for your little ones.',
                image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=800', 
                slug: 'kids-wear' 
              },
              { 
                name: 'Customized Outfits', 
                description: 'Get your dream outfit tailored to perfection.',
                image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800', 
                slug: 'customized-outfits' 
              },
              { 
                name: 'Rental Costumes', 
                description: 'Premium designer wear available for rent.',
                image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800', 
                slug: 'rental-costumes' 
              },
              { 
                name: 'Ethnic Wear', 
                description: 'Timeless traditional styles with a modern touch.',
                image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800', 
                slug: 'ethnic-wear' 
              },
              { 
                name: 'Party Wear', 
                description: 'Dazzling outfits for your most memorable nights.',
                image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800', 
                slug: 'party-wear' 
              },
              { 
                name: 'Dresses', 
                description: 'From casual day dresses to elegant evening gowns.',
                image: 'https://images.unsplash.com/photo-1571227319197-6099c126f548?auto=format&fit=crop&q=80&w=800', 
                slug: 'dresses' 
              },
              { 
                name: 'Casual Wear', 
                description: 'Effortless everyday styles for your relaxed moments.',
                image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800', 
                slug: 'casual-wear' 
              },
              { 
                name: 'Workwear', 
                description: 'Command the boardroom with our sophisticated professional attire.',
                image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800', 
                slug: 'workwear' 
              },
              { 
                name: 'Footwear', 
                description: 'Step out in style with our curated selection of premium shoes.',
                image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800', 
                slug: 'footwear' 
              }
            ].map((col) => (
              <Link 
                key={col.name} 
                to={`/shop?category=${col.slug}`}
                className="group relative min-w-[300px] md:min-w-[400px] h-[450px] rounded-3xl overflow-hidden shadow-lg snap-start"
              >
                <img 
                  src={col.image} 
                  alt={col.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-white font-display text-3xl font-bold mb-2">{col.name}</h3>
                  <p className="text-white/80 text-sm mb-4 line-clamp-2">{col.description}</p>
                  <div className="flex items-center text-white font-bold text-sm group-hover:translate-x-2 transition-transform">
                    Explore Collection <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Trends Section */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Explore Latest Trends</h2>
            <p className="text-gray-500">Stay ahead of the fashion curve with our seasonal picks</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                name: 'Spring Arrivals', 
                description: 'Fresh florals and pastel hues to welcome the new season.',
                image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800', 
                slug: 'spring-arrivals' 
              },
              { 
                name: 'Summer Essentials', 
                description: 'Breezy fabrics and sun-kissed styles for your tropical getaway.',
                image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800', 
                slug: 'summer-essentials' 
              },
              { 
                name: 'Autumn Edit', 
                description: 'Cozy knits and rich earthy tones for the crisp golden days.',
                image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800', 
                slug: 'autumn-edit' 
              },
              { 
                name: 'Winter Glamour', 
                description: 'Elegant layers and sophisticated textures for the cold season.',
                image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800', 
                slug: 'winter-glamour' 
              }
            ].map((col) => (
              <Link 
                key={col.name} 
                to={`/shop?category=${col.slug}`}
                className="group relative h-80 rounded-3xl overflow-hidden shadow-lg"
              >
                <img 
                  src={col.image} 
                  alt={col.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white font-display text-2xl font-bold mb-1">{col.name}</h3>
                  <p className="text-white/90 text-xs mb-3 line-clamp-2">{col.description}</p>
                  <div className="flex items-center text-white font-bold text-xs group-hover:translate-x-2 transition-transform">
                    Shop Trend <ArrowRight size={14} className="ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-display text-4xl font-bold text-gray-900 mb-2">New Arrivals</h2>
              <p className="text-gray-500">The latest additions to our boutique collection</p>
            </div>
            <Link to="/shop?sort=newest" className="text-brand-600 font-bold hover:underline flex items-center">
              View All New <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Silk Evening Wrap',
                description: 'Luxurious silk wrap for elegant evenings.',
                image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
                price: '₹2,499'
              },
              {
                name: 'Velvet Midi Dress',
                description: 'A sophisticated velvet dress for special occasions.',
                image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
                price: '₹4,999'
              },
              {
                name: 'Crystal Embellished Clutch',
                description: 'The perfect accessory to complete your party look.',
                image: 'https://images.unsplash.com/photo-1566150905458-1bf1fd113961?auto=format&fit=crop&q=80&w=800',
                price: '₹3,299'
              }
            ].map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative aspect-4/5 rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-brand-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    New
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{item.description}</p>
                <p className="text-brand-600 font-bold">{item.price}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-2">Featured Collection</h2>
            <p className="text-gray-500">Handpicked styles for your elegant wardrobe</p>
          </div>
          <Link to="/shop" className="text-brand-600 font-bold hover:underline flex items-center">
            View All <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product: any) => (
            <motion.div 
              key={product.id}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-brand-50"
            >
              <div className="relative aspect-3/4 overflow-hidden">
                <Link to={`/product/${product.id}`}>
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                {product.is_featured && (
                  <span className="absolute top-4 left-4 bg-gold-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Featured
                  </span>
                )}
                {/* Quick Add Buttons */}
                <div className="absolute bottom-4 left-4 right-4 flex space-x-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      setQuickAddProduct(product);
                      if (product.sizes?.length > 0) setSelectedSize(product.sizes[0]);
                      if (product.colors?.length > 0) setSelectedColor(product.colors[0]);
                    }}
                    className="flex-1 bg-white/90 backdrop-blur-sm text-brand-600 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-brand-600 hover:text-white"
                  >
                    <ShoppingBag size={18} />
                    <span>Quick Add</span>
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
                        size: product.sizes?.[0] || '',
                        color: product.colors?.[0] || ''
                      });
                      navigate('/checkout');
                    }}
                    className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-bold flex items-center justify-center shadow-lg hover:bg-brand-700 transition-all"
                  >
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
              <Link to={`/product/${product.id}`}>
                <div className="p-6">
                  <p className="text-xs text-brand-500 font-bold uppercase tracking-widest mb-1">{product.category_name}</p>
                  <h3 className="font-display text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                    <div className="flex text-gold-500">
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                      <Star size={14} fill="currentColor" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {quickAddProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setQuickAddProduct(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>

              <div className="flex space-x-6 mb-8">
                <div className="w-24 h-32 rounded-xl overflow-hidden shrink-0">
                  <img src={quickAddProduct.image_url} alt={quickAddProduct.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">{quickAddProduct.name}</h3>
                  <p className="text-xl font-bold text-brand-600">₹{quickAddProduct.price}</p>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                {quickAddProduct.sizes?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Select Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {quickAddProduct.sizes.map((size: string) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${selectedSize === size ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-100 text-gray-600 hover:border-brand-300'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {quickAddProduct.colors?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Select Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {quickAddProduct.colors.map((color: string) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 rounded-full border-2 text-xs font-medium transition-all ${selectedColor === color ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-100 text-gray-600 hover:border-brand-300'}`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={() => {
                    addToCart({
                      id: quickAddProduct.id,
                      name: quickAddProduct.name,
                      price: quickAddProduct.price,
                      image_url: quickAddProduct.image_url,
                      quantity: 1,
                      size: selectedSize,
                      color: selectedColor
                    });
                    setQuickAddProduct(null);
                  }}
                  className="flex-1 bg-white text-brand-600 border-2 border-brand-600 py-4 rounded-full font-bold flex items-center justify-center space-x-2 hover:bg-brand-50 transition-all shadow-sm"
                >
                  <ShoppingBag size={20} />
                  <span>Add to Cart</span>
                </button>
                <button 
                  onClick={() => {
                    addToCart({
                      id: quickAddProduct.id,
                      name: quickAddProduct.name,
                      price: quickAddProduct.price,
                      image_url: quickAddProduct.image_url,
                      quantity: 1,
                      size: selectedSize,
                      color: selectedColor
                    });
                    setQuickAddProduct(null);
                    navigate('/checkout');
                  }}
                  className="flex-1 bg-brand-600 text-white py-4 rounded-full font-bold flex items-center justify-center hover:bg-brand-700 transition-all shadow-lg"
                >
                  <span>Buy Now</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visit Us Section */}
      <section className="py-20 bg-brand-50/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-[3rem] overflow-hidden shadow-xl border border-brand-100 flex flex-col lg:flex-row">
            <div className="lg:w-1/2 h-[400px] lg:h-auto relative">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200" 
                alt="Boutique Interior" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-600/10"></div>
            </div>
            <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center">
              <h2 className="font-display text-4xl font-bold text-gray-900 mb-6">Visit Our Boutique</h2>
              <p className="text-gray-500 mb-10 leading-relaxed">
                Experience the elegance of Lily Boutique in person. Our flagship store offers a curated selection of our finest collections in a sophisticated setting.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-brand-50 p-3 rounded-2xl text-brand-600 mr-5">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Our Location</h4>
                    <p className="text-gray-500 text-sm">74/211, RK COMPLEX, PERIYAMARIYAMMAN KOVIL ST, THIRUCHENGODE, NAMAKKAL</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-brand-50 p-3 rounded-2xl text-brand-600 mr-5">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Contact Number</h4>
                    <p className="text-gray-500 text-sm">+91 72000 40250</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-brand-50 p-3 rounded-2xl text-brand-600 mr-5">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Store Hours</h4>
                    <p className="text-gray-500 text-sm">Mon - Sat: 10:00 AM - 9:00 PM<br />Sun: 11:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Shop Our Instagram</h2>
          <p className="text-gray-500">Tag us @LilyBoutique to be featured</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1554412930-c74f660013bd?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1475184414782-596563478482?auto=format&fit=crop&q=80&w=600'
          ].map((img, i) => (
            <div key={i} className="relative aspect-square group overflow-hidden">
              <img 
                src={img} 
                alt="Instagram"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-brand-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="text-white" size={32} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
