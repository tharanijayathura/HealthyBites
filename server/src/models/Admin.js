import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, default: 'Administrator', trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
  status: { type: String, enum: ['pending', 'active'], default: 'active' },
  lastLogin: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Admin', adminSchema);
