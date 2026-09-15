import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { errorResponse } from '@/lib/http';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: 'desc' },
      include: { beat: true },
    });
    return NextResponse.json({ sales });
  } catch (err) {
    return errorResponse(err);
  }
}