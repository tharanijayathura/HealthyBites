import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  key: { type: String, default: 'primary', unique: true },
  businessName: { type: String, default: 'Healy Bite' },
  tagline: { type: String, default: 'Fuel Your Fitness. Nourish Your Body.' },
  email: { type: String, default: 'vmsadtharani@gmail.com' },
  phone: { type: String, default: '0712599785' },
  whatsappNumber: { type: String, default: '94712599785' },
  deliveryFee: { type: Number, default: 0, min: 0 },
  deliveryEnabled: { type: Boolean, default: true },
  pickupEnabled: { type: Boolean, default: true },
  pickupLocation: { type: String, default: 'Healy Bite Hub, Colombo 03, Sri Lanka' },
  cutoffTime: { type: String, default: '8:00 PM' },
  orderThrough: { type: String, default: 'Wholesome, delicious meals made to nourish your body and power your day.' },
  deliveryAreas: { type: String, default: 'Moratuwa, Rawathawatta, Katubedda, Angulana, Rathmalana, Suwarapola, Piliyandala' },
  paymentMethod: { type: String, default: 'COD only' },
  description: { type: String, default: 'Freshly prepared, protein-rich gym meals crafted for fitness enthusiasts and athletes across Colombo.' },
  blackoutDates: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Setting', settingSchema);
