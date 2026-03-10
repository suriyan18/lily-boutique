import mongoose from 'mongoose';

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: mongoose.Schema.Types.ObjectId,
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  size: String,
  color: String
});

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema],
}, { timestamps: true });

export default mongoose.model('Cart', CartSchema);
