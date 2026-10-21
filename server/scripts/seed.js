import 'dotenv/config';
import { connectDB } from '../src/config/db.js';
import Meal from '../src/models/Meal.js';
import Setting from '../src/models/Setting.js';
import mongoose from 'mongoose';

const mealsData = [
  {
    name: 'Grilled Chicken & Steamed Greens Power Plate',
    description: 'Tender sliced lemon-herb chicken breast paired with farm-fresh steamed broccoli florets, sautéed mushrooms, hard-boiled eggs, and juicy cherry tomatoes.',
    price: 1350,
    imageUrl: '/images/food/1.png',
    icon: '🍗',
    category: 'High Protein',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    isActive: true,
    isSoldOut: false,
    calories: 520,
    protein: 52,
    carbs: 16,
    fat: 18,
    ingredients: ['Chicken Breast', 'Broccoli', 'Eggs', 'Mushrooms', 'Cherry Tomatoes', 'Olive Oil', 'Herb Seasoning'],
    allergens: ['Eggs'],
    stock: 45
  },
  {
    name: 'Prime Seared Beef Steak & Avocado Bowl',
    description: 'Grass-fed seared steak slices cooked tender, accompanied by twin sunny-side farm eggs, creamy avocado slices, and vine-ripened tomatoes.',
    price: 1650,
    imageUrl: '/images/food/2.png',
    icon: '🥩',
    category: 'Keto & Low Carb',
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    isActive: true,
    isSoldOut: false,
    calories: 620,
    protein: 54,
    carbs: 8,
    fat: 36,
    ingredients: ['Lean Beef Sirloin', 'Farm Fresh Eggs', 'Ripe Avocado', 'Vine Tomatoes', 'Coarse Black Pepper', 'Himalayan Pink Salt'],
    allergens: ['Eggs'],
    stock: 35
  },
  {
    name: 'Signature Acai Protein & Roasted Granola Bowl',
    description: 'Chilled antioxidant-rich acai berry blend topped with crispy roasted oats, whole almonds, raw cashews, fresh strawberry fans, banana coins, and wild blueberries.',
    price: 1150,
    imageUrl: '/images/food/3.png',
    icon: '🍓',
    category: 'Pre-Workout & Energy',
    availableDays: ['Monday', 'Wednesday', 'Saturday', 'Sunday'],
    isActive: true,
    isSoldOut: false,
    calories: 440,
    protein: 22,
    carbs: 66,
    fat: 12,
    ingredients: ['Acai Berry Puree', 'Whey Protein Isolate', 'Toasted Rolled Oats', 'Almonds', 'Cashews', 'Strawberries', 'Bananas', 'Blueberries'],
    allergens: ['Tree Nuts'],
    stock: 50
  },
  {
    name: 'Atlantic Herb-Crusted Salmon & Baby Potatoes',
    description: 'Pan-seared Norwegian salmon fillets seasoned with cracked pepper and thyme, served alongside roasted golden baby potatoes, crisp broccoli, and fresh lemon wedges.',
    price: 1850,
    imageUrl: '/images/food/4.png',
    icon: '🐟',
    category: 'Omega-3 & Recovery',
    availableDays: ['Wednesday', 'Friday', 'Sunday'],
    isActive: true,
    isSoldOut: false,
    calories: 580,
    protein: 46,
    carbs: 38,
    fat: 24,
    ingredients: ['Wild Salmon Fillet', 'Baby Potatoes', 'Broccoli Florets', 'Lemon', 'Garlic Butter', 'Fresh Thyme'],
    allergens: ['Fish'],
    stock: 30
  },
  {
    name: 'Crispy Chicken Katsu & Jasmine Rice Bowl',
    description: 'Golden oven-crisped chicken cutlet sliced over warm jasmine rice, finished with sweet corn kernels, fresh cucumber wheels, and sweet vine tomatoes.',
    price: 1290,
    imageUrl: '/images/food/5.png',
    icon: '🍚',
    category: 'Clean Bulk',
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    isActive: true,
    isSoldOut: false,
    calories: 640,
    protein: 45,
    carbs: 68,
    fat: 16,
    ingredients: ['Chicken Breast Fillet', 'Jasmine Rice', 'Sweet Corn', 'English Cucumber', 'Cherry Tomatoes', 'Sesame Seeds'],
    allergens: ['Sesame'],
    stock: 40
  },
  {
    name: 'Golden Roasted Chicken & Brown Rice Box',
    description: 'Juicy golden-roasted chicken quarter portion sliced and served with fiber-rich brown rice, crisp cucumber ribbons, and garden green lettuce leaves.',
    price: 1250,
    imageUrl: '/images/food/6.png',
    icon: '🍗',
    category: 'High Protein',
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    isActive: true,
    isSoldOut: false,
    calories: 490,
    protein: 48,
    carbs: 45,
    fat: 11,
    ingredients: ['Roasted Chicken Breast', 'Brown Basmati Rice', 'Garden Lettuce', 'Cucumber Slices', 'Natural Herbs'],
    allergens: [],
    stock: 50
  },
  {
    name: 'Lean Shred Sweet Potato & Farm Egg Plate',
    description: 'Roasted whole sweet potato, three farm-fresh boiled eggs, and cooling cucumber slices. The ultimate clean, low-sodium cutting meal for maximum muscle definition.',
    price: 950,
    imageUrl: '/images/food/7.png',
    icon: '🍠',
    category: 'Lean & Cut',
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
    isActive: true,
    isSoldOut: false,
    calories: 390,
    protein: 26,
    carbs: 42,
    fat: 12,
    ingredients: ['Whole Roasted Sweet Potato', 'Boiled Farm Eggs', 'Cucumber', 'Sea Salt'],
    allergens: ['Eggs'],
    stock: 50
  }
];

try {
  await connectDB();
  
  // Clean and insert sample meals
  await Meal.deleteMany({});
  await Meal.insertMany(mealsData);
  console.log(`Seeded ${mealsData.length} premium gym meals with real images and nutrition data.`);

  // Upsert business settings
  await Setting.findOneAndUpdate(
    { key: 'primary' },
    {
      key: 'primary',
      businessName: 'Healy Bite',
      tagline: 'Fuel Your Fitness. Nourish Your Body.',
      email: 'vmsadtharani@gmail.com',
      phone: '0712599785',
      whatsappNumber: '94712599785',
      deliveryFee: 250,
      deliveryEnabled: true,
      pickupEnabled: true,
      pickupLocation: 'Healy Bite Hub, Colombo 03, Sri Lanka',
      cutoffTime: '8:00 PM',
      description: 'Healy Bite delivers freshly prepared, macro-balanced nutritious meals designed for gym enthusiasts, athletes, and active professionals across Colombo.',
      blackoutDates: []
    },
    { upsert: true, new: true }
  );

  console.log('Business settings updated successfully.');
} catch (e) {
  console.error('Seed error:', e.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
