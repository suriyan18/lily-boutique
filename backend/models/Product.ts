import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  price: { type: Number, required: true },
  salePrice: Number,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categoryName: String,
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  imageUrl: String,
  stock: { type: Number, default: 0 },
  sku: { type: String, unique: true },
  status: { type: String, default: 'active' },
  sizes: [String],
  colors: [String],
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);
