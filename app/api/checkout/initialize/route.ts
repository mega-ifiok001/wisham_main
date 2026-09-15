import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { config } from '@/lib/config';
import { initializeTransaction } from '@/lib/services/paystack';
import { usdToSubunit } from '@/lib/services/fx';
import { HttpError, errorResponse, readJson } from '@/lib/http';

export const runtime = 'nodejs';

interface InitializeBody {
  beatId?: string;
  licenseType?: 'exclusive' | 'inclusive';
  includesStems?: boolean;
  email?: string;
  name?: string;
}

export async function POST(req: Request) {
  try {
    const { beatId, licenseType, includesStems, email, name } = await readJson<InitializeBody>(req);

    if (!beatId || !email || !licenseType || !['exclusive', 'inclusive'].includes(licenseType)) {
      throw new HttpError(400, 'beatId, licenseType and email are required');
    }
    if (!String(email).includes('@')) {
      throw new HttpError(400, 'Please provide a valid email');
    }

    const beat = await prisma.beat.findUnique({ where: { id: beatId } });
    if (!beat) throw new HttpError(404, 'Beat not found');
    if (beat.isSold) {
      throw new HttpError(410, 'This beat has been sold exclusively and is no longer available.');
    }

    const includeStems = Boolean(includesStems);
    let amountUsd: number;
    if (licenseType === 'exclusive') {
      amountUsd = beat.exclusivePrice; // stems included
    } else if (includeStems) {
      amountUsd = beat.inclusiveStemsPrice; // $40
    } else {
      amountUsd = beat.inclusivePrice; // $30
    }

    const reference = `WSH-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    // Convert USD price into the merchant's Paystack currency (e.g. NGN)
    let amountSubunit: number;
    try {
      amountSubunit = await usdToSubunit(amountUsd, config.paystackCurrency);
    } catch (fxErr) {
      throw new HttpError(
        502,
        `Cannot convert pricing to ${config.paystackCurrency}: ${(fxErr as Error).message}`
      );
    }

    // Persist a pending sale BEFORE charging so the webhook can find it
    const sale = await prisma.sale.create({
      data: {
        beatId: beat.id,
        beatTitle: beat.title,
        buyerEmail: email,
        buyerName: name || null,
        licenseType,
        includesStems: licenseType === 'exclusive' ? true : includeStems,
        amountUsd,
        currency: config.paystackCurrency,
        paymentRef: reference,
        paymentStatus: 'pending',
      },
    });

    try {
      const data = await initializeTransaction({
        amountSubunit,
        email,
        reference,
        currency: config.paystackCurrency,
        metadata: {
          saleId: sale.id,
          beatId: beat.id,
          licenseType,
          includesStems: licenseType === 'exclusive' ? true : includeStems,
          buyerEmail: email,
          amountUsd,
        },
      });

      return NextResponse.json({
        authorizationUrl: data.authorization_url,
        reference,
        saleId: sale.id,
        amountUsd,
        licenseType,
      });
    } catch (err) {
      // Roll back the pending sale if Paystack rejected the transaction
      await prisma.sale.delete({ where: { id: sale.id } }).catch(() => {});
      throw err;
    }
  } catch (err) {
    return errorResponse(err);
  }
}