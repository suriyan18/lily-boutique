import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  imageUrl: String,
  quantity: Number,
  price: Number,
  size: String,
  color: String,
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  phone: String,
  address: String, // String fallback for now
  paymentMethod: String,
  status: { type: String, default: 'pending' }, // pending, confirmed, shipped, delivered, cancelled
  paymentStatus: { type: String, default: 'pending' }, // pending, successful, failed
  trackingId: String,
  razorpayOrderId: String,
  items: [OrderItemSchema],
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
