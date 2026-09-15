import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { errorResponse } from '@/lib/http';

export const runtime = 'nodejs';

/**
 * Public catalog — only beats still available for purchase.
 * Supports pagination + filtering + sorting:
 *   /api/beats?page=1&limit=8&genre=Trap&q=night&sort=newest|price-low|price-high|bpm
 */
export async function GET(req: Request) {
  try {
    const sp = new URL(req.url).searchParams;

    const page = Math.max(1, Number(sp.get('page') || 1) || 1);
    const limit = Math.min(24, Math.max(1, Number(sp.get('limit') || 8) || 8));
    const sort = sp.get('sort') || 'newest';
    const genre = sp.get('genre') || '';
    const q = (sp.get('q') || '').trim();

    const where: Record<string, unknown> = { isSold: false };
    if (genre && genre !== 'All') where.genre = genre;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { genre: { contains: q, mode: 'insensitive' } },
        { keySignature: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orderBy =
      sort === 'price-low'
        ? { inclusivePrice: 'asc' as const }
        : sort === 'price-high'
        ? { inclusivePrice: 'desc' as const }
        : sort === 'bpm'
        ? { bpm: 'asc' as const }
        : { createdAt: 'desc' as const };

    const [beats, total] = await Promise.all([
      prisma.beat.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.beat.count({ where }),
    ]);

    return NextResponse.json({
      beats,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (err) {
    return errorResponse(err);
  }
}