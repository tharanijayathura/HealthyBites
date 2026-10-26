import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import multer from 'multer';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Admin from '../models/Admin.js';
import Meal, { DAYS, CATEGORIES } from '../models/Meal.js';
import Order from '../models/Order.js';
import Setting from '../models/Setting.js';
import User from '../models/User.js';
import { requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../../client/public/images/uploads');
const s3Bucket = process.env.AWS_S3_BUCKET;
const s3Region = process.env.AWS_REGION;
const s3Client = s3Bucket && s3Region ? new S3Client({ region: s3Region }) : null;

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `meal_${Date.now()}_${cleanName}${ext}`);
  }
});

const upload = multer({
  storage: s3Client ? multer.memoryStorage() : storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/image\/(jpeg|jpg|png|webp|gif)/i.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP and GIF image formats are allowed.'));
    }
  }
});

const router = Router();
const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 15, standardHeaders: 'draft-8', legacyHeaders: false });
const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/api', maxAge: 8 * 60 * 60 * 1000 };

// 1. Admin Login
router.post('/login', loginLimiter, asyncRoute(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const admin = await Admin.findOne({ email });
  if (admin?.status === 'pending') {
    return res.status(403).json({ message: 'Your administrator account is awaiting super-admin approval.' });
  }
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  const token = jwt.sign(
    { id: String(admin._id), role: admin.role || 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '8h', algorithm: 'HS256' }
  );

  res.cookie('hb_admin', token, cookieOptions).json({
    email: admin.email,
    name: admin.name || 'Administrator',
    role: admin.role || 'admin'
  });
}));

// Staff registration creates a pending account. Only a super-admin can approve it.
router.post('/register', loginLimiter, asyncRoute(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!name || name.length > 80) {
    return res.status(400).json({ message: 'Please enter your name.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Valid email address is required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }
  if (await Admin.findOne({ email })) {
    return res.status(409).json({ message: 'An administrator with this email already exists.' });
  }

  const admin = await Admin.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: 'admin',
    status: 'pending'
  });

  res.status(201).json({
    pendingApproval: true,
    email: admin.email,
    message: 'Registration submitted. A super-admin must approve your staff account before you can sign in.'
  });
}));

// 2. Admin Logout
router.post('/logout', (_req, res) => res.clearCookie('hb_admin', { ...cookieOptions, maxAge: undefined }).json({ ok: true }));

// 3. Admin Current Session
router.get('/me', requireAdmin, asyncRoute(async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select('-passwordHash').lean();
  if (!admin) return res.status(401).json({ message: 'Admin account not found' });
  res.json({ email: admin.email, name: admin.name, role: admin.role, status: admin.status });
}));

// PROTECTED ADMIN ROUTES BELOW
router.use(requireAdmin);

const requireSuperAdmin = (req, res, next) => {
  if (req.admin?.role !== 'superadmin') {
    return res.status(403).json({ message: 'Only a super administrator can manage administrator accounts.' });
  }
  next();
};

// 4. Image Upload Endpoint for Admin
router.post('/upload-image', upload.single('image'), asyncRoute(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image file.' });
  }

  if (s3Client) {
    const ext = path.extname(req.file.originalname).toLowerCase();
    const key = `meals/meal_${Date.now()}${ext}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: s3Bucket,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      CacheControl: 'public, max-age=31536000, immutable'
    }));

    return res.json({
      success: true,
      imageUrl: `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${key}`,
      filename: key
    });
  }

  const relativePath = `/images/uploads/${req.file.filename}`;
  res.json({
    success: true,
    imageUrl: relativePath,
    filename: req.file.filename
  });
}));

// 5. Admin Team Management
router.get('/admins', requireSuperAdmin, asyncRoute(async (_req, res) => {
  const admins = await Admin.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
  res.json(admins);
}));

router.post('/admins', requireSuperAdmin, asyncRoute(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const role = req.body?.role === 'superadmin' ? 'superadmin' : 'admin';

  if (!name || !email || password.length < 8) {
    return res.status(400).json({ message: 'Name, valid email, and minimum 8-character password are required.' });
  }
  if (await Admin.findOne({ email })) {
    return res.status(409).json({ message: 'Admin with this email already exists.' });
  }

  const admin = await Admin.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role
  });

  res.status(201).json({ email: admin.email, name: admin.name, role: admin.role });
}));

router.patch('/admins/:id/approve', requireSuperAdmin, asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid admin ID' });
  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    { status: 'active' },
    { new: true, runValidators: true }
  ).select('-passwordHash').lean();
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  res.json(admin);
}));

router.patch('/admins/:id/revoke', requireSuperAdmin, asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid admin ID' });
  if (String(req.params.id) === String(req.admin.id)) {
    return res.status(400).json({ message: 'You cannot revoke your own super admin account.' });
  }
  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    { status: 'pending' },
    { new: true, runValidators: true }
  ).select('-passwordHash').lean();
  if (!admin) return res.status(404).json({ message: 'Admin not found' });
  res.json(admin);
}));

router.delete('/admins/:id', requireSuperAdmin, asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid admin ID' });
  if (String(req.params.id) === String(req.admin.id)) {
    return res.status(400).json({ message: 'You cannot delete your own admin account.' });
  }
  await Admin.findByIdAndDelete(req.params.id);
  res.json({ message: 'Admin removed successfully.' });
}));

// 7. Dashboard Overview Stats & Rich Analytics
router.get('/stats', asyncRoute(async (_req, res) => {
  const [meals, orders, totalUsers] = await Promise.all([
    Meal.find().lean(),
    Order.find().lean(),
    User.countDocuments()
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
    verifiedRevenue,
    totalRegisteredCustomers: totalUsers
  });
}));

router.get('/analytics', asyncRoute(async (_req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).lean();

  // Aggregate popular meals
  const mealSales = {};
  for (const order of orders) {
    if (order.status === 'cancelled') continue;
    for (const item of order.items) {
      if (!mealSales[item.name]) {
        mealSales[item.name] = { name: item.name, portions: 0, revenue: 0 };
      }
      mealSales[item.name].portions += item.quantity;
      mealSales[item.name].revenue += item.quantity * item.price;
    }
  }

  const topDishes = Object.values(mealSales)
    .sort((a, b) => b.portions - a.portions)
    .slice(0, 7);

  // Delivery vs Pickup
  const deliveryCount = orders.filter(o => o.customer?.orderType !== 'pickup').length;
  const pickupCount = orders.filter(o => o.customer?.orderType === 'pickup').length;

  // Revenue by status
  const revenueByStatus = {
    confirmed: orders.filter(o => o.status === 'confirmed').reduce((s, o) => s + o.total, 0),
    preparing: orders.filter(o => o.status === 'preparing').reduce((s, o) => s + o.total, 0),
    completed: orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0),
    pending: orders.filter(o => o.status === 'pending_whatsapp').reduce((s, o) => s + o.total, 0)
  };

  res.json({
    topDishes,
    orderTypes: { delivery: deliveryCount, pickup: pickupCount },
    revenueByStatus
  });
}));

router.get('/super-analytics', asyncRoute(async (_req, res) => {
  const [orders, users, admins, meals] = await Promise.all([
    Order.find().select('createdAt total status items customer.orderType').sort({ createdAt: 1 }).lean(),
    User.countDocuments(),
    Admin.countDocuments(),
    Meal.countDocuments()
  ]);

  const completedStatuses = new Set(['confirmed', 'preparing', 'completed']);
  const validOrders = orders.filter(order => order.status !== 'cancelled');
  const verifiedOrders = orders.filter(order => completedStatuses.has(order.status));
  const totalRevenue = verifiedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalPortions = validOrders.reduce(
    (sum, order) => sum + (order.items || []).reduce((itemSum, item) => itemSum + (item.quantity || 0), 0),
    0
  );

  const dateKey = (date, type) => {
    const value = new Date(date);
    if (type === 'year') return String(value.getFullYear());
    if (type === 'month') return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
    if (type === 'week') {
      const start = new Date(value);
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day + 1);
      return start.toISOString().slice(0, 10);
    }
    return value.toISOString().slice(0, 10);
  };

  const buildSeries = (type, count) => {
    const now = new Date();
    const keys = [];
    for (let index = count - 1; index >= 0; index -= 1) {
      const date = new Date(now);
      if (type === 'day') date.setDate(now.getDate() - index);
      if (type === 'week') date.setDate(now.getDate() - index * 7);
      if (type === 'month') date.setMonth(now.getMonth() - index);
      if (type === 'year') date.setFullYear(now.getFullYear() - index);
      keys.push(dateKey(date, type));
    }
    return keys.map(key => {
      const matching = validOrders.filter(order => dateKey(order.createdAt, type) === key);
      const verified = matching.filter(order => completedStatuses.has(order.status));
      return {
        label: key,
        orders: matching.length,
        revenue: verified.reduce((sum, order) => sum + (order.total || 0), 0)
      };
    });
  };

  res.json({
    totals: {
      totalRevenue,
      totalOrders: validOrders.length,
      totalPortions,
      registeredCustomers: users,
      administratorAccounts: admins,
      meals
    },
    series: {
      daily: buildSeries('day', 7),
      weekly: buildSeries('week', 8),
      monthly: buildSeries('month', 12),
      yearly: buildSeries('year', 5)
    }
  });
}));

// Meal details parser
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
