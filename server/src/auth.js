import jwt from 'jsonwebtoken';
import { config } from './config.js';

const TOKEN_TTL = '7d';

export function signAdminToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, { expiresIn: TOKEN_TTL });
}

export function requireAdmin(req, res, next) {
  const token = req.cookies?.wisham_admin;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.admin = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
}