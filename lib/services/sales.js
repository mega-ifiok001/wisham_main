import crypto from 'node:crypto';
import prisma from '../prisma.js';
import { verifyTransaction } from './paystack.js';
import { generateLicenseHash } from './license.js';
import { sendExclusiveSaleEmail, sendInclusiveSaleEmail } from './email.js';

function randomToken() {
  return crypto.randomBytes(18).toString('hex');
}

/**
 * Called after Paystack confirms a transaction (via verify endpoint or webhook).
 * Idempotent: calling twice with the same reference is safe.
 */
export async function finalizeSale(reference) {
  const data = await verifyTransaction(reference);

  const sale = await prisma.sale.findUnique({ where: { paymentRef: reference } });
  if (!sale) {
    const e = new Error('Sale not found for this reference');
    e.code = 'SALE_NOT_FOUND';
    throw e;
  }

  // Already finalized — return as-is (no duplicate email, no double sell)
  if (sale.paymentStatus === 'success') {
    return prisma.sale.findUnique({ where: { id: sale.id }, include: { beat: true } });
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
    // amountUsd is the true USD price; the local amount charged lives in paystackMeta
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

    // Exclusive sale => the beat leaves the marketplace forever
    if (sale.licenseType === 'exclusive' && beat && !beat.isSold) {
      await tx.beat.update({ where: { id: beat.id }, data: { isSold: true, soldAt: new Date() } });
    }
    return u;
  });

  // Email is best-effort — never fail a valid sale because Resend hiccupped.
  try {
    if (sale.licenseType === 'exclusive' && beat) {
      await sendExclusiveSaleEmail(updated, beat);
    } else if (beat) {
      await sendInclusiveSaleEmail(updated);
    }
    await prisma.sale.update({ where: { id: updated.id }, data: { emailSent: true } });
  } catch (e) {
    console.error('Purchase email dispatch failed (sale is still valid):', e.message);
  }

  return prisma.sale.findUnique({ where: { id: updated.id }, include: { beat: true } });
}