import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  deliveryDate: { type: String, required: true },
  imageUrl: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    whatsappNumber: { type: String, default: '' },
    email: { type: String, default: '' },
    orderType: { type: String, enum: ['delivery', 'pickup'], default: 'delivery' },
    address: { type: String, default: '' },
    deliveryTime: { type: String, default: '' }
  },
  items: { type: [orderItemSchema], required: true },
  notes: { type: String, default: '' },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending_whatsapp', 'confirmed', 'preparing', 'completed', 'cancelled'],
    default: 'pending_whatsapp'
  }
}, { timestamps: true });

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'customer.phone': 1 });

export default mongoose.model('Order', orderSchema);
