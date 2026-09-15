import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { errorResponse } from '@/lib/http';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalSales,
      paidSales,
      totalBeats,
      soldBeats,
      revenueRows,
      exclusiveCount,
      inclusiveCount,
      recent,
    ] = await Promise.all([
      prisma.sale.count(),
      prisma.sale.count({ where: { paymentStatus: 'success' } }),
      prisma.beat.count(),
      prisma.beat.count({ where: { isSold: true } }),
      prisma.sale.aggregate({ where: { paymentStatus: 'success' }, _sum: { amountUsd: true } }),
      prisma.sale.count({ where: { licenseType: 'exclusive', paymentStatus: 'success' } }),
      prisma.sale.count({ where: { licenseType: 'inclusive', paymentStatus: 'success' } }),
      prisma.sale.findMany({
        where: { paymentStatus: 'success' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { beat: true },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalSales,
        paidSales,
        totalRevenueUsd: revenueRows._sum.amountUsd || 0,
        totalBeats,
        soldBeats,
        exclusiveCount,
        inclusiveCount,
        pendingSales: totalSales - paidSales,
      },
      recent,
    });
  } catch (err) {
    return errorResponse(err);
  }
}