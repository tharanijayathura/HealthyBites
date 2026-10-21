import jwt from 'jsonwebtoken';

export function requireAdmin(req, res, next) {
  const token = req.cookies?.hb_admin;
  if (!token) return res.status(401).json({ message: 'Please sign in as admin' });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    next();
  } catch {
    return res.status(401).json({ message: 'Admin session expired' });
  }
}
