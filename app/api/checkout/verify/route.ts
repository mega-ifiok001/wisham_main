import { NextResponse } from 'next/server';
import { finalizeSale } from '@/lib/services/sales';
import { HttpError, errorResponse } from '@/lib/http';

export const runtime = 'nodejs';

/** Called by the /checkout page after Paystack redirects the buyer back. */
export async function GET(req: Request) {
  try {
    const reference = new URL(req.url).searchParams.get('reference');
    if (!reference) throw new HttpError(400, 'Missing reference');

    const sale = await finalizeSale(reference);

    return NextResponse.json({
      success: true,
      sale: {
        id: sale.id,
        beatTitle: sale.beatTitle,
        buyerEmail: sale.buyerEmail,
        licenseType: sale.licenseType,
        includesStems: sale.includesStems,
        amountUsd: sale.amountUsd,
        licenseHash: sale.licenseHash || null,
        paid: sale.paymentStatus === 'success',
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}