import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  phone: { type: String, required: true, trim: true },
  whatsappNumber: { type: String, default: '', trim: true },
  address: { type: String, default: '', trim: true, maxlength: 300 },
  role: { type: String, default: 'customer' }
}, { timestamps: true });

userSchema.index({ phone: 1 });

export default mongoose.model('User', userSchema);
