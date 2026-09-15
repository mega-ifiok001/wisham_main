import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { errorResponse } from '@/lib/http';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await requireAdmin();
    const user = await prisma.adminUser.findUnique({ where: { email: session.email } });
    return NextResponse.json({ admin: { email: user?.email, name: user?.name } });
  } catch (err) {
    return errorResponse(err);
  }
}