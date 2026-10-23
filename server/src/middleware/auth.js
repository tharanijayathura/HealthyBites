import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export async function requireAdmin(req, res, next) {
  const token = req.cookies?.hb_admin;
  if (!token) return res.status(401).json({ message: 'Please sign in as admin' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const admin = await Admin.findById(payload.id).select('-passwordHash').lean();
    if (!admin) return res.status(401).json({ message: 'Admin account not found' });
    if (admin.status !== 'active') {
      return res.status(403).json({ message: 'Your administrator account is awaiting super-admin approval.' });
    }
    req.admin = { ...admin, id: String(admin._id) };
    next();
  } catch {
    return res.status(401).json({ message: 'Admin session expired' });
  }
}
