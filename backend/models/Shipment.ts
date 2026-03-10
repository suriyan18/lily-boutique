import mongoose from 'mongoose';

const ShipmentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  shippingMethodId: mongoose.Schema.Types.ObjectId,
  trackingNumber: String,
  shipmentStatus: { type: String, default: 'pending' }, // pending, shipped, out_for_delivery, delivered
  shippedAt: Date,
  deliveredAt: Date,
}, { timestamps: true });

export default mongoose.model('Shipment', ShipmentSchema);
