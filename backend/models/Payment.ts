import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  paymentMethod: { type: String, required: true }, // UPI, CARD, NET_BANKING, COD
  paymentGateway: { type: String, default: 'Internal' },
  transactionId: String,
  amount: { type: Number, required: true },
  status: { type: String, default: 'pending' }, // pending, successful, failed, refunded
}, { timestamps: true });

export default mongoose.model('Payment', PaymentSchema);
