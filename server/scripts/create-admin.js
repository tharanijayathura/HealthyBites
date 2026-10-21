import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/db.js';
import Admin from '../src/models/Admin.js';

try {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.startsWith('REPLACE_')) {
    throw new Error('Configure a valid ADMIN_EMAIL and a unique ADMIN_PASSWORD (12+ characters) in server/.env');
  }
  await connectDB();
  if (await Admin.exists({ email })) throw new Error('Admin already exists. No existing password was changed.');
  await Admin.create({ email, passwordHash: await bcrypt.hash(password, 12) });
  console.log(`Admin account created: ${email}. Remove ADMIN_PASSWORD from server/.env after setup.`);
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
