import mongoose from 'mongoose';

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const CATEGORIES = ['High Protein', 'Lean & Cut', 'Keto & Low Carb', 'Clean Bulk', 'Pre-Workout & Energy', 'Omega-3 & Recovery'];

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  price: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: '' },
  icon: { type: String, default: '🥗' },
  category: { type: String, default: 'High Protein' },
  availableDays: [{ type: String, enum: DAYS }],
  isActive: { type: Boolean, default: true },
  isSoldOut: { type: Boolean, default: false },
  calories: { type: Number, min: 0, default: null },
  protein: { type: Number, min: 0, default: null },
  carbs: { type: Number, min: 0, default: null },
  fat: { type: Number, min: 0, default: null },
  ingredients: [{ type: String, trim: true }],
  allergens: [{ type: String, trim: true }],
  stock: { type: Number, min: 0, default: 50 }
}, { timestamps: true });

mealSchema.index({ isActive: 1, availableDays: 1 });
mealSchema.index({ category: 1 });

export default mongoose.model('Meal', mealSchema);
