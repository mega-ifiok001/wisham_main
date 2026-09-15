import { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import prisma from '../prisma.js';
import { config } from '../config.js';
import { initializeTransaction, verifyWebhookSignature } from '../services/paystack.js';
import { usdToSubunit } from '../services/fx.js';
import { finalizeSale } from '../services/sales.js';

export const publicRouter = Router();

// ---------------- Health ----------------
publicRouter.get('/health', (_req, res) => {
  res.json({ ok: true, name: 'wisham-api' });
});

// ---------------- Public beat catalog ----------------
publicRouter.get('/beats', async (_req, res, next) => {
  try {
    const beats = await prisma.beat.findMany({
      where: { isSold: false },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ beats });
  } catch (err) {
    next(err);
  }
});

publicRouter.get('/beats/:id', async (req, res, next) => {
  try {
    const beat = await prisma.beat.findUnique({ where: { id: req.params.id } });
    if (!beat) return res.status(404).json({ error: 'Beat not found' });
    res.json({ beat });
  } catch (err) {
    next(err);
  }
});

// ---------------- Checkout initialize ----------------
// body: { beatId, licenseType: 'exclusive'|'inclusive', includesStems: boolean, email, name? }
publicRouter.post('/checkout/initialize', async (req, res, next) => {
  try {
    const { beatId, licenseType, includesStems, email, name } = req.body || {};

    if (!beatId || !email || !['exclusive', 'inclusive'].includes(licenseType)) {
      return res.status(400).json({ error: 'beatId, licenseType and email are required' });
    }
    if (!String(email).includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email' });
    }

    const beat = await prisma.beat.findUnique({ where: { id: beatId } });
    if (!beat) return res.status(404).json({ error: 'Beat not found' });

    if (beat.isSold) {
      return res.status(410).json({ error: 'This beat has been sold exclusively and is no longer available.' });
    }

    // Pick the price based on the license tier
    const includeStems = Boolean(includesStems);
    let amountUsd;
    if (licenseType === 'exclusive') {
      amountUsd = beat.exclusivePrice; // stems included
    } else if (includeStems) {
      amountUsd = beat.inclusiveStemsPrice; // $40
    } else {
      amountUsd = beat.inclusivePrice; // $30
    }

    const reference = `WSH-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    // Convert the USD price into the merchant's Paystack currency (e.g. NGN)
    let amountSubunit;
    try {
      amountSubunit = await usdToSubunit(amountUsd, config.paystackCurrency);
    } catch (fxErr) {
      return res.status(502).json({ error: `Cannot convert pricing to ${config.paystackCurrency}: ${fxErr.message}` });
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
      res.json({
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
    next(err);
  }
});

// ---------------- Checkout verify (called from our /checkout page) ----------------
// ?reference=WSH-...
publicRouter.get('/checkout/verify', async (req, res, next) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ error: 'Missing reference' });

    const sale = await finalizeSale(String(reference));
    res.json({
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
    next(err);
  }
});

// ---------------- Download (via unique token from the email) ----------------
// GET /api/download/:saleId/:token?file=master|stems
publicRouter.get('/download/:saleId/:token', async (req, res, next) => {
  try {
    const { saleId, token } = req.params;
    const file = req.query.file === 'stems' ? 'stems' : 'master';

    const sale = await prisma.sale.findFirst({
      where: { id: saleId, downloadToken: token, paymentStatus: 'success' },
      include: { beat: true },
    });

    if (!sale) return res.status(404).json({ error: 'Download link is invalid or expired.' });

    // Links expire 48h after the purchase
    const expiry = new Date(sale.createdAt.getTime() + 48 * 60 * 60 * 1000);
    if (Date.now() > expiry.getTime()) {
      return res.status(410).json({ error: 'This download link has expired. Contact WISHAM for a new link.' });
    }

    if (file === 'stems' && !sale.includesStems) {
      return res.status(403).json({ error: 'This purchase does not include stems.' });
    }

    const url = file === 'stems' ? sale.beat.stemsUrl : sale.beat.audioUrl;
    if (!url) {
      return res.status(404).json({ error: 'File has not been published yet. Contact WISHAM.' });
    }

    // Local server-side file (uploaded through the admin panel)
    if (url.startsWith('/uploads/')) {
      const uploadRoot = path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadRoot, path.basename(url));
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing on server.' });
      res.download(filePath);
      return;
    }

    // Remote URL (e.g. R2 / S3 / CDN signed URL) — redirect straight to it
    return res.redirect(302, url);
  } catch (err) {
    next(err);
  }
});

// ---------------- Paystack webhook ----------------
publicRouter.post('/webhooks/paystack', async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const raw = req.rawBody || '';

  const valid = signature ? await verifyWebhookSignature(String(signature), raw) : false;
  if (!valid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.body?.event;
  const reference = req.body?.data?.reference;

  // Fire and forget — respond fast, finalize in background
  if (event === 'charge.success' && reference) {
    finalizeSale(String(reference)).catch((err) => {
      console.error('Webhook finalize failed:', err.message);
    });
  }

  res.status(200).json({ received: true });
});