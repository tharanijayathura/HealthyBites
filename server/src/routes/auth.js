import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Admin from '../models/Admin.js';

const router = Router();
const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 25, standardHeaders: 'draft-8', legacyHeaders: false });
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/api',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Middleware to extract logged-in customer
export const requireCustomer = async (req, res, next) => {
  try {
    const token = req.cookies?.hb_user || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ message: 'Please sign in to your Healy Bite account' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.id) return res.status(401).json({ message: 'Invalid authentication session' });
    const user = await User.findById(payload.id).select('-passwordHash').lean();
    if (!user) return res.status(401).json({ message: 'User account not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Authentication expired or invalid' });
  }
};

// Customer Registration
router.post('/register', authLimiter, asyncRoute(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const phone = String(req.body?.phone || '').trim();
  const whatsappNumber = String(req.body?.whatsappNumber || '').trim();
  const address = String(req.body?.address || '').trim();

  if (!name || name.length > 100) {
    return res.status(400).json({ message: 'Please enter your full name.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }
  if (!phone || !/^\+?\d[\d\s-]{7,17}$/.test(phone)) {
    return res.status(400).json({ message: 'Please enter a valid contact phone number.' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    phone,
    whatsappNumber: whatsappNumber || phone,
    address
  });

  const token = jwt.sign(
    { id: String(user._id), role: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' }
  );

  res.cookie('hb_user', token, cookieOptions).status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      whatsappNumber: user.whatsappNumber,
      address: user.address
    }
  });
}));

// Customer Login
router.post('/login', authLimiter, asyncRoute(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter your email and password.' });
  }

  const admin = await Admin.findOne({ email });
  if (admin) {
    if (admin.status === 'pending') {
      return res.status(403).json({ message: 'Your staff account is awaiting super-admin approval.' });
    }
    if (!(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: String(admin._id), role: admin.role || 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h', algorithm: 'HS256' }
    );
    admin.lastLogin = new Date();
    await admin.save();

    return res.cookie('hb_admin', token, {
      ...cookieOptions,
      maxAge: 8 * 60 * 60 * 1000
    }).json({
      admin: {
        id: String(admin._id),
        email: admin.email,
        name: admin.name || 'Administrator',
        role: admin.role || 'admin'
      }
    });
  }

  const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'No customer account was found for this email. Please create an account first.'
      });
    }

    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        message: 'The password is incorrect. Please check it and try again.'
      });
    }

  const token = jwt.sign(
    { id: String(user._id), role: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' }
  );

  res.cookie('hb_user', token, cookieOptions).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      whatsappNumber: user.whatsappNumber,
      address: user.address
    }
  });
}));

// Logout
router.post('/logout', (_req, res) => {
  res.clearCookie('hb_user', { ...cookieOptions, maxAge: undefined }).json({ ok: true });
});

// Get Current User Profile
router.get('/me', requireCustomer, (req, res) => {
  res.json({ user: req.user });
});

// Update Profile
router.put('/profile', requireCustomer, asyncRoute(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const phone = String(req.body?.phone || '').trim();
  const whatsappNumber = String(req.body?.whatsappNumber || '').trim();
  const address = String(req.body?.address || '').trim();

  if (!name || !phone) {
    return res.status(400).json({ message: 'Name and phone are required.' });
  }

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, whatsappNumber, address },
    { new: true, runValidators: true }
  ).select('-passwordHash').lean();

  res.json({ user: updated });
}));

// Customer Past Orders
router.get('/my-orders', requireCustomer, asyncRoute(async (req, res) => {
  const orders = await Order.find({
    $or: [
      { user: req.user._id },
      { 'customer.email': req.user.email },
      { 'customer.phone': req.user.phone }
    ]
  }).sort({ createdAt: -1 }).limit(50).lean();

  res.json(orders);
}));

export default router;
