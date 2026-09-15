import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { config } from './config';
import { HttpError } from './http';

export const ADMIN_COOKIE = 'wisham_admin';

export function signAdminToken(user: { id: string; email: string }) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, { expiresIn: '7d' });
}

/** Read the admin session from the request cookies (null when signed out). */
export async function getAdmin(): Promise<{ id: string; email: string } | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string; email: string };
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

/** Throws a 401 unless a valid admin session exists. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new HttpError(401, 'Not authenticated');
  return admin;
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}