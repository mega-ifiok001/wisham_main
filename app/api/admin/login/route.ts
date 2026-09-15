import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { ADMIN_COOKIE, adminCookieOptions, signAdminToken } from '@/lib/auth';
import { HttpError, errorResponse, readJson } from '@/lib/http';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email, password } = await readJson<{ email?: string; password?: string }>(req);
    if (!email || !password) throw new HttpError(400, 'Email and password required');

    const user = await prisma.adminUser.findUnique({
      where: { email: String(email).toLowerCase() },
    });
    if (!user) throw new HttpError(401, 'Invalid credentials');

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) throw new HttpError(401, 'Invalid credentials');

    const res = NextResponse.json({ admin: { email: user.email, name: user.name } });
    res.cookies.set(ADMIN_COOKIE, signAdminToken(user), adminCookieOptions());
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}