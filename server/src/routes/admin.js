import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Meal, { DAYS, CATEGORIES } from '../models/Meal.js';
import Order from '../models/Order.js';
import Setting from '../models/Setting.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false });
const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/api', maxAge: 8 * 60 * 60 * 1000 };

router.post('/login', loginLimiter, asyncRoute(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const admin = await Admin.findOne({ email });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
  const token = jwt.sign({ id: String(admin._id), role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h', algorithm: 'HS256' });
  res.cookie('hb_admin', token, cookieOptions).json({ email: admin.email });
}));

router.post('/logout', (_req, res) => res.clearCookie('hb_admin', { ...cookieOptions, maxAge: undefined }).json({ ok: true }));

router.get('/me', requireAdmin, asyncRoute(async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('email').lean();
  if (!admin) return res.status(401).json({ message: 'Admin account not found' });
  res.json({ email: admin.email });
}));

router.use(requireAdmin);

// Dashboard overview stats
router.get('/stats', asyncRoute(async (_req, res) => {
  const [meals, orders] = await Promise.all([
    Meal.find().lean(),
    Order.find().lean()
  ]);

  const activeMeals = meals.filter(m => m.isActive).length;
  const soldOutMeals = meals.filter(m => m.isSoldOut).length;
  const pendingOrders = orders.filter(o => o.status === 'pending_whatsapp').length;
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
  const preparingOrders = orders.filter(o => o.status === 'preparing').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

  const verifiedRevenue = orders
    .filter(o => ['confirmed', 'preparing', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  res.json({
    totalMeals: meals.length,
    activeMeals,
    soldOutMeals,
    totalOrders: orders.length,
    pendingOrders,
    confirmedOrders,
    preparingOrders,
    completedOrders,
    cancelledOrders,
    verifiedRevenue
  });
}));

const parseMeal = (body) => {
  const name = String(body?.name || '').trim();
  const description = String(body?.description || '').trim();
  const price = Number(body?.price);
  const availableDays = body?.availableDays;
  const imageUrl = String(body?.imageUrl || '').trim();
  const icon = String(body?.icon || '🥗').trim();
  const category = String(body?.category || 'High Protein').trim();
  const isSoldOut = Boolean(body?.isSoldOut);
  const isActive = body?.isActive !== false;

  const calories = body?.calories != null && body?.calories !== '' ? Number(body?.calories) : null;
  const protein = body?.protein != null && body?.protein !== '' ? Number(body?.protein) : null;
  const carbs = body?.carbs != null && body?.carbs !== '' ? Number(body?.carbs) : null;
  const fat = body?.fat != null && body?.fat !== '' ? Number(body?.fat) : null;
  const stock = body?.stock != null && body?.stock !== '' ? Number(body?.stock) : 50;

  // Allow comma-separated string or array for ingredients & allergens
  let ingredients = [];
  if (Array.isArray(body?.ingredients)) {
    ingredients = body.ingredients.map(i => String(i).trim()).filter(Boolean);
  } else if (typeof body?.ingredients === 'string') {
    ingredients = body.ingredients.split(',').map(i => i.trim()).filter(Boolean);
  }

  let allergens = [];
  if (Array.isArray(body?.allergens)) {
    allergens = body.allergens.map(a => String(a).trim()).filter(Boolean);
  } else if (typeof body?.allergens === 'string') {
    allergens = body.allergens.split(',').map(a => a.trim()).filter(Boolean);
  }

  if (!name || name.length > 100 || description.length > 500 || !Number.isFinite(price) || price < 0) {
    return null;
  }

  if (!Array.isArray(availableDays) || availableDays.some(d => !DAYS.includes(d))) {
    return null;
  }

  // Validate image URL: allow relative paths (e.g., /images/food/1.png) or valid http/https URLs
  if (imageUrl) {
    const isRelative = /^\/[a-zA-Z0-9_\-./]+$/.test(imageUrl);
    const isHttp = /^https?:\/\//i.test(imageUrl);
    if (!isRelative && !isHttp) return null;
  }

  return {
    name,
    description,
    price,
    availableDays: [...new Set(availableDays)],
    imageUrl,
    icon,
    category,
    isActive,
    isSoldOut,
    calories: Number.isFinite(calories) ? calories : null,
    protein: Number.isFinite(protein) ? protein : null,
    carbs: Number.isFinite(carbs) ? carbs : null,
    fat: Number.isFinite(fat) ? fat : null,
    ingredients,
    allergens,
    stock: Number.isFinite(stock) ? stock : 50
  };
};

router.get('/meals', asyncRoute(async (_req, res) => {
  const meals = await Meal.find().sort({ createdAt: -1 }).lean();
  res.json(meals);
}));

router.post('/meals', asyncRoute(async (req, res) => {
  const data = parseMeal(req.body);
  if (!data) return res.status(400).json({ message: 'Invalid meal details provided.' });
  const meal = await Meal.create(data);
  res.status(201).json(meal);
}));

router.put('/meals/:id', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid meal ID' });
  const data = parseMeal(req.body);
  if (!data) return res.status(400).json({ message: 'Invalid meal details provided.' });
  const meal = await Meal.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!meal) return res.status(404).json({ message: 'Meal not found' });
  res.json(meal);
}));

router.delete('/meals/:id', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid meal ID' });
  const { permanent } = req.query;
  if (permanent === 'true') {
    await Meal.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Meal permanently deleted' });
  }
  const meal = await Meal.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!meal) return res.status(404).json({ message: 'Meal not found' });
  res.json({ message: 'Meal archived' });
}));

router.patch('/meals/:id/toggle-soldout', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid meal ID' });
  const meal = await Meal.findById(req.params.id);
  if (!meal) return res.status(404).json({ message: 'Meal not found' });
  meal.isSoldOut = !meal.isSoldOut;
  await meal.save();
  res.json(meal);
}));

router.get('/orders', asyncRoute(async (req, res) => {
  const { status, search } = req.query;
  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }
  if (search) {
    const s = String(search).trim();
    filter.$or = [
      { code: new RegExp(s, 'i') },
      { 'customer.name': new RegExp(s, 'i') },
      { 'customer.phone': new RegExp(s, 'i') }
    ];
  }
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  res.json(orders);
}));

router.patch('/orders/:id/status', asyncRoute(async (req, res) => {
  const statuses = ['pending_whatsapp', 'confirmed', 'preparing', 'completed', 'cancelled'];
  if (!mongoose.isValidObjectId(req.params.id) || !statuses.includes(req.body?.status)) {
    return res.status(400).json({ message: 'Invalid order or status value' });
  }
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
}));

router.get('/settings', asyncRoute(async (_req, res) => {
  const settings = await Setting.findOne({ key: 'primary' }).lean();
  res.json(settings || {});
}));

router.put('/settings', asyncRoute(async (req, res) => {
  const {
    businessName,
    tagline,
    email,
    phone,
    whatsappNumber,
    deliveryFee,
    pickupLocation,
    cutoffTime,
    description,
    blackoutDates,
    deliveryEnabled,
    pickupEnabled
  } = req.body || {};

  const cleanPhone = String(phone || '').trim();
  const cleanWhatsApp = String(whatsappNumber || '').trim();
  const fee = Number(deliveryFee);

  if (!String(businessName || '').trim()) {
    return res.status(400).json({ message: 'Business name is required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''))) {
    return res.status(400).json({ message: 'Valid contact email is required' });
  }
  if (!/^\+?[\d\s-]{9,20}$/.test(cleanPhone)) {
    return res.status(400).json({ message: 'Valid phone number is required' });
  }
  if (!/^\d{10,15}$/.test(cleanWhatsApp)) {
    return res.status(400).json({ message: 'Valid WhatsApp number (10-15 digits with country code) is required' });
  }
  if (!Number.isFinite(fee) || fee < 0) {
    return res.status(400).json({ message: 'Delivery fee must be a positive number' });
  }

  const settings = await Setting.findOneAndUpdate(
    { key: 'primary' },
    {
      businessName: String(businessName).trim(),
      tagline: String(tagline || 'Fuel Your Fitness. Nourish Your Body.').trim(),
      email: String(email).trim(),
      phone: cleanPhone,
      whatsappNumber: cleanWhatsApp,
      deliveryFee: fee,
      pickupLocation: String(pickupLocation || 'Healy Bite Hub, Colombo 03, Sri Lanka').trim(),
      cutoffTime: String(cutoffTime || '8:00 PM').trim(),
      description: String(description || '').trim(),
      blackoutDates: Array.isArray(blackoutDates) ? blackoutDates : [],
      deliveryEnabled: deliveryEnabled !== false,
      pickupEnabled: pickupEnabled !== false
    },
    { upsert: true, new: true, runValidators: true }
  );

  res.json(settings);
}));

export default router;
