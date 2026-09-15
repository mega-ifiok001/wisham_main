import crypto from 'node:crypto';
import prisma from '../prisma.js';
import { verifyTransaction } from './paystack.js';
import { generateLicenseHash } from './license.js';
import { sendExclusiveSaleEmail, sendInclusiveSaleEmail } from './email.js';

function randomToken() {
  return crypto.randomBytes(18).toString('hex');
}

/**
 * FluentPrice: used after Paystack confirms a transaction (via verify or webhook).
 * Idempotent: calling twice with the same reference is safe.
 */
export async function finalizeSale(reference) {
  let data;
  try {
    data = await verifyTransaction(reference);
  } catch (err) {
    console.error('finalizeSale verify failed:', err.message);
    throw err;
  }

  const sale = await prisma.sale.findUnique({ where: { paymentRef: reference } });
  if (!sale) {
    const e = new Error('Sale not found for this reference');
    e.code = 'SALE_NOT_FOUND';
    throw e;
  }

  // Idempotent — already finalized
  if (sale.paymentStatus === 'success') {
    const existing = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: { beat: true },
    });
    return existing;
  }

  if (data.status !== 'success') {
    await prisma.sale.update({ where: { id: sale.id }, data: { paymentStatus: 'failed' } });
    const e = new Error('Payment was not successful.');
    e.code = 'PAYMENT_FAILED';
    throw e;
  }

  const beat = await prisma.beat.findUnique({ where: { id: sale.beatId } });

  const updates = {
    paymentStatus: 'success',
    paymentRef: reference,
    currency: data.currency || sale.currency,
    // amountUsd is the true USD price we charged against; the local currency amount
    // charged (kobo etc.) is recorded inside paystackMeta.amount.
    amountUsd: sale.amountUsd,
    paystackMeta: data,
  };

  if (sale.licenseType === 'exclusive' && !sale.licenseHash) {
    updates.licenseHash = generateLicenseHash(sale.beatId, sale.buyerEmail);
  }
  if (!sale.downloadToken) {
    updates.downloadToken = randomToken();
  }

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.sale.update({ where: { id: sale.id }, data: updates });

    // Exclusive sale => beat leaves the marketplace forever
    if (sale.licenseType === 'exclusive' && beat && !beat.isSold) {
      await tx.beat.update({
        where: { id: beat.id },
        data: { isSold: true, soldAt: new Date() },
      });
    }
    return u;
  });

  // Email is best-effort — never fail the sale if Resend hiccups.
  try {
    if (sale.licenseType === 'exclusive' && beat) {
      await sendExclusiveSaleEmail(updated, beat);
    } else if (beat) {
      await sendInclusiveSaleEmail(updated);
    }
    if (!updated.emailSent) {
      await prisma.sale.update({ where: { id: updated.id }, data: { emailSent: true } });
    }
  } catch (e) {
    console.error('Purchase email dispatch failed (sale is still valid):', e.message);
  }

  return prisma.sale.findUnique({ where: { id: updated.id }, include: { beat: true } });
}