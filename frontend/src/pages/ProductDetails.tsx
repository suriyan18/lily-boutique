import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Star, ArrowLeft, Heart, Share2, Shield, Truck, RotateCcw, MessageSquare, Send, User, Calendar } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [prodData, revData] = await Promise.all([
          apiFetch(`/api/products/${id}`),
          apiFetch(`/api/products/${id}/reviews`)
        ]);
        
        setProduct(prodData);
        setReviews(revData);
        if (prodData.sizes?.length > 0) setSelectedSize(prodData.sizes[0]);
        if (prodData.colors?.length > 0) setSelectedColor(prodData.colors[0]);
      } catch (err) {
        console.error("Error fetching product details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity,
      size: selectedSize,
      color: selectedColor
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please log in to submit a review.");
      return;
    }
    
    setSubmitting(true);
    try {
      const newReview = await apiFetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, review_text: comment }),
      });
      setReviews([newReview, ...reviews]); // Add new review to the top
      setComment('');
      setRating(5);
      toast.success("Review submitted successfully!");
    } catch (err: any) {
      console.error("Error submitting review:", err);
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-cream-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="aspect-3/4 rounded-3xl overflow-hidden border border-brand-100 shadow-lg cursor-zoom-in"
            >
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.05 }}
                  className="aspect-square rounded-xl overflow-hidden border border-brand-100 cursor-pointer hover:opacity-75 transition-all"
                >
                  <img src={product.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <p className="text-brand-600 font-bold uppercase tracking-widest mb-2">{product.category_name}</p>
              <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex text-gold-500">
                  {[1,2,3,4,5].map(i => (
                    <Star 
                      key={i} 
                      size={18} 
                      fill={i <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? "currentColor" : "none"} 
                      className={i <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? "" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-gray-500 text-sm">({reviews.length} Reviews)</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">₹{product.price}</p>
            </div>

            <p className="text-gray-600 leading-relaxed font-body">
              {product.description || "Elevate your wardrobe with this stunning piece from Lily Boutique. Crafted with premium materials and attention to detail, this item combines timeless elegance with modern flair."}
            </p>

            {/* Selectors */}
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all ${selectedSize === size ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-100 text-gray-600 hover:border-brand-300'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Select Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${selectedColor === color ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-100 text-gray-600 hover:border-brand-300'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center border border-brand-100 rounded-full">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:text-brand-600"
                  >
                    -
                  </button>
                  <span className="px-4 font-bold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 hover:text-brand-600"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">{product.stock} items in stock</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                  handleAddToCart();
                  navigate('/cart');
                }}
                className="flex-1 bg-white text-brand-600 border-2 border-brand-600 py-4 rounded-full font-bold flex items-center justify-center space-x-2 hover:bg-brand-50 transition-all shadow-sm"
              >
                <ShoppingBag size={20} />
                <span>Add to Cart</span>
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 bg-brand-600 text-white py-4 rounded-full font-bold flex items-center justify-center space-x-2 hover:bg-brand-700 transition-all shadow-lg"
              >
                <span>Buy Now</span>
              </button>
              <button className="p-4 rounded-full border border-brand-100 text-gray-600 hover:bg-brand-50 transition-all">
                <Heart size={24} />
              </button>
              <button className="p-4 rounded-full border border-brand-100 text-gray-600 hover:bg-brand-50 transition-all">
                <Share2 size={24} />
              </button>
            </div>

            {/* Extra Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-brand-100">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck size={18} className="text-brand-500" />
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RotateCcw size={18} className="text-brand-500" />
                <span>7-Day Returns</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield size={20} className="text-brand-600 shrink-0" />
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-brand-100">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Review Summary */}
            <div className="space-y-6">
              <h2 className="font-display text-3xl font-bold text-gray-900">Customer Reviews</h2>
              <div className="flex items-center space-x-4">
                <div className="text-5xl font-bold text-gray-900">
                  {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}
                </div>
                <div>
                  <div className="flex text-gold-500 mb-1">
                    {[1,2,3,4,5].map(i => (
                      <Star 
                        key={i} 
                        size={20} 
                        fill={i <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? "currentColor" : "none"} 
                        className={i <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? "" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm">Based on {reviews.length} reviews</p>
                </div>
              </div>

              {/* Review Form */}
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4 pt-6 border-t border-brand-50">
                  <h3 className="font-bold text-gray-900">Write a Review</h3>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Rating</label>
                    <div className="flex space-x-2">
                      {[1,2,3,4,5].map(i => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(i)}
                          className="text-gold-500 hover:scale-110 transition-transform"
                        >
                          <Star size={24} fill={i <= rating ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Your Comment</label>
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-brand-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all min-h-[120px]"
                      placeholder="Share your thoughts about this product..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-600 text-white py-3 rounded-full font-bold hover:bg-brand-700 transition-all disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Post Review"}
                  </button>
                </form>
              ) : (
                <div className="p-6 bg-brand-50 rounded-2xl border border-brand-100 text-center">
                  <p className="text-gray-600 mb-4">Please log in to share your review.</p>
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-brand-600 font-bold hover:underline"
                  >
                    Log In Now
                  </button>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-8">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <motion.div 
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="pb-8 border-b border-brand-50 last:border-0"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{review.user_name}</p>
                          <div className="flex text-gold-500">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} size={14} fill={i <= review.rating ? "currentColor" : "none"} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-400 text-xs">
                        <Calendar size={12} className="mr-1" />
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                  <Star size={48} className="mb-4 opacity-20" />
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
