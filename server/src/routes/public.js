import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Meal, { DAYS } from '../models/Meal.js';
import Order from '../models/Order.js';
import Setting from '../models/Setting.js';
import { validateDeliveryDate } from '../utils/dates.js';
import { buildWhatsAppMessage } from '../utils/whatsapp.js';

const router = Router();
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const checkoutLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false });

router.get('/health', (_req, res) => res.json({
  ok: true,
  service: 'Healy Bite API',
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}));

router.get('/meals', asyncRoute(async (req, res) => {
  const { day, category } = req.query;
  if (day && !DAYS.includes(day)) return res.status(400).json({ message: 'Invalid weekday' });
  const filter = { isActive: true };
  if (day) filter.availableDays = day;
  if (category) filter.category = category;

  const meals = await Meal.find(filter).sort({ name: 1 }).lean();
  res.json(meals);
}));

router.get('/meals/:id', asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid meal ID' });
  }
  const meal = await Meal.findOne({ _id: req.params.id, isActive: true }).lean();
  if (!meal) return res.status(404).json({ message: 'Meal not found' });
  res.json(meal);
}));

router.get('/settings', asyncRoute(async (_req, res) => {
  const settings = await Setting.findOne({ key: 'primary' }).lean();
  res.json({
    businessName: settings?.businessName || 'Healy Bite',
    tagline: settings?.tagline || 'Fuel Your Fitness. Nourish Your Body.',
    email: settings?.email || 'vmsadtharani@gmail.com',
    phone: settings?.phone || '0712599785',
    whatsappNumber: settings?.whatsappNumber || '94712599785',
    deliveryFee: settings?.deliveryFee ?? 0,
    deliveryEnabled: settings?.deliveryEnabled ?? true,
    pickupEnabled: settings?.pickupEnabled ?? true,
    pickupLocation: settings?.pickupLocation || 'Healy Bite Hub, Colombo 03, Sri Lanka',
    cutoffTime: settings?.cutoffTime || '8:00 PM',
    orderThrough: settings?.orderThrough || 'Wholesome, delicious meals made to nourish your body and power your day.',
    deliveryAreas: settings?.deliveryAreas || 'Moratuwa, Rawathawatta, Katubedda, Angulana, Rathmalana, Suwarapola, Piliyandala',
    paymentMethod: settings?.paymentMethod || 'COD only',
    description: settings?.description || 'Freshly prepared, protein-rich gym meals crafted for fitness enthusiasts and athletes across Colombo.',
    blackoutDates: settings?.blackoutDates || []
  });
}));

router.post('/orders', checkoutLimiter, asyncRoute(async (req, res) => {
  const { customer, items, notes = '' } = req.body || {};
  const name = String(customer?.name || '').trim();
  const phone = String(customer?.phone || '').trim();
  const whatsappNumber = String(customer?.whatsappNumber || '').trim();
  const email = String(customer?.email || '').trim();
  const orderType = customer?.orderType === 'pickup' ? 'pickup' : 'delivery';
  const address = String(customer?.address || '').trim();
  const deliveryTime = String(customer?.deliveryTime || '').trim();
  const noteText = String(notes).trim();

  if (!name || name.length > 100) {
    return res.status(400).json({ message: 'Please enter your full name.' });
  }
  if (!phone || !/^\+?\d[\d\s-]{7,17}$/.test(phone)) {
    return res.status(400).json({ message: 'Please enter a valid contact phone number.' });
  }
  if (orderType === 'delivery' && (!address || address.length < 3 || address.length > 300)) {
    return res.status(400).json({ message: 'Please enter a valid delivery address in Colombo.' });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address format.' });
  }
  if (!Array.isArray(items) || items.length < 1 || items.length > 30) {
    return res.status(400).json({ message: 'Your cart must contain between 1 and 30 items.' });
  }

  const settings = await Setting.findOne({ key: 'primary' }).lean();
  const blackoutDates = new Set(settings?.blackoutDates || []);

  const uniqueKeys = new Set();
  const normalizedItems = [];

  for (const item of items) {
    const mealId = item?.mealId;
    const quantity = item?.quantity;
    const deliveryDate = item?.deliveryDate;

    if (!mongoose.isValidObjectId(mealId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return res.status(400).json({ message: 'Invalid meal or quantity selected.' });
    }

    const key = `${mealId}:${deliveryDate}`;
    if (uniqueKeys.has(key)) {
      return res.status(400).json({ message: 'Duplicate meal selection for the same delivery date.' });
    }
    uniqueKeys.add(key);

    const meal = await Meal.findOne({ _id: mealId, isActive: true }).lean();
    if (!meal) {
      return res.status(409).json({ message: 'One of your selected meals is currently unavailable.' });
    }
    if (meal.isSoldOut) {
      return res.status(409).json({ message: `${meal.name} is currently sold out.` });
    }

    if (blackoutDates.has(deliveryDate)) {
      return res.status(409).json({ message: `Ordering is closed for ${deliveryDate}. Please choose another delivery date.` });
    }

    const weekdayDate = new Date(`${deliveryDate}T00:00:00Z`);
    const dayName = Number.isNaN(weekdayDate.getTime()) ? '' : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][weekdayDate.getUTCDay()];
    
    if (!meal.availableDays.includes(dayName) || !validateDeliveryDate(deliveryDate, dayName)) {
      return res.status(409).json({ message: `${meal.name} is not offered on ${deliveryDate} (${dayName}).` });
    }

    normalizedItems.push({
      meal: meal._id,
      name: meal.name,
      price: meal.price,
      quantity,
      deliveryDate,
      imageUrl: meal.imageUrl || ''
    });
  }

  const targetWhatsApp = settings?.whatsappNumber || '94712599785';
  if (!/^\d{10,15}$/.test(targetWhatsApp)) {
    return res.status(503).json({ message: 'Business WhatsApp has not been properly configured.' });
  }

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = orderType === 'pickup' ? 0 : (settings?.deliveryFee ?? 0);
  const total = subtotal + deliveryFee;

  const code = `HB-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  let userId = null;
  const userToken = req.cookies?.hb_user || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (userToken) {
    try {
      const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
      if (decoded?.id && mongoose.isValidObjectId(decoded.id)) userId = decoded.id;
    } catch {}
  }

  const order = await Order.create({
    code,
    user: userId,
    customer: {
      name,
      phone,
      whatsappNumber,
      email,
      orderType,
      address: orderType === 'pickup' ? 'Pickup at Hub' : address,
      deliveryTime
    },
    notes: noteText,
    items: normalizedItems,
    subtotal,
    deliveryFee,
    total,
    status: 'pending_whatsapp'
  });

  const message = buildWhatsAppMessage(order);

  res.status(201).json({
    orderCode: order.code,
    status: order.status,
    total: order.total,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    whatsappUrl: `https://wa.me/${targetWhatsApp}?text=${encodeURIComponent(message)}`
  });
}));

export default router;
