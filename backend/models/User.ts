import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, default: 'customer' }, // admin, customer, manager
  status: { type: String, default: 'active' },
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
