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
  const existing = await Admin.findOne({ email });
  if (existing) {
    existing.name = 'Super Admin';
    existing.role = 'superadmin';
    existing.status = 'active';
    existing.passwordHash = await bcrypt.hash(password, 12);
    await existing.save();
    console.log(`Existing admin updated to super-admin with latest password: ${email}.`);
  } else {
    await Admin.create({
      name: 'Super Admin',
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: 'superadmin',
      status: 'active'
    });
    console.log(`Super-admin account created: ${email}.`);
  }
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
