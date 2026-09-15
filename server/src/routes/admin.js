import { Router } from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import fs from 'node:fs';
import prisma from '../prisma.js';
import { requireAdmin, signAdminToken } from '../auth.js';

export const adminRouter = Router();

// ---------- Uploads (kept private — only served via download tokens) ----------
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB
const uploadFields = upload.fields([{ name: 'audioFile', maxCount: 1 }, { name: 'stemsFile', maxCount: 1 }]);

// ---------- Auth ----------
adminRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await prisma.adminUser.findUnique({ where: { email: String(email).toLowerCase() } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signAdminToken(user);
    res.cookie('wisham_admin', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ admin: { email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

adminRouter.post('/logout', (_req, res) => {
  res.clearCookie('wisham_admin');
  res.json({ ok: true });
});

adminRouter.get('/me', requireAdmin, async (req, res) => {
  try {
    const user = await prisma.adminUser.findUnique({ where: { email: req.admin.email } });
    res.json({ admin: { email: user?.email, name: user?.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load admin' });
  }
});

// ---------- Beats ----------
adminRouter.get('/beats', requireAdmin, async (_req, res, next) => {
  try {
    const beats = await prisma.beat.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ beats });
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/beats', requireAdmin, uploadFields, async (req, res, next) => {
  try {
    const f = req.files || {};
    const audioUrl = f.audioFile?.[0] ? `/uploads/${f.audioFile[0].filename}` : (req.body.audioUrl || null);
    const stemsUrl = f.stemsFile?.[0] ? `/uploads/${f.stemsFile[0].filename}` : (req.body.stemsUrl || null);

    const beat = await prisma.beat.create({
      data: {
        title: req.body.title,
        artist: req.body.artist || 'WISHAM',
        genre: req.body.genre || 'Trap',
        bpm: Number(req.body.bpm || 120),
        keySignature: req.body.keySignature || 'C Minor',
        description: req.body.description || null,
        duration: req.body.duration || '3:00',
        coverGradient: req.body.coverGradient || 'from-red-500 to-red-700',
        audioUrl,
        stemsUrl,
        exclusivePrice: Number(req.body.exclusivePrice || 60),
        inclusivePrice: Number(req.body.inclusivePrice || 30),
        inclusiveStemsPrice: Number(req.body.inclusiveStemsPrice || 40),
      },
    });
    res.status(201).json({ beat });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/beats/:id', requireAdmin, uploadFields, async (req, res, next) => {
  try {
    const id = req.params.id;
    const existing = await prisma.beat.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Beat not found' });

    const f = req.files || {};
    const data = {
      title: req.body.title ?? existing.title,
      artist: req.body.artist ?? existing.artist,
      genre: req.body.genre ?? existing.genre,
      bpm: req.body.bpm !== undefined ? Number(req.body.bpm) : existing.bpm,
      keySignature: req.body.keySignature ?? existing.keySignature,
      description: req.body.description ?? existing.description,
      duration: req.body.duration ?? existing.duration,
      coverGradient: req.body.coverGradient ?? existing.coverGradient,
      exclusivePrice: req.body.exclusivePrice !== undefined ? Number(req.body.exclusivePrice) : existing.exclusivePrice,
      inclusivePrice: req.body.inclusivePrice !== undefined ? Number(req.body.inclusivePrice) : existing.inclusivePrice,
      inclusiveStemsPrice: req.body.inclusiveStemsPrice !== undefined ? Number(req.body.inclusiveStemsPrice) : existing.inclusiveStemsPrice,
    };

    if (f.audioFile?.[0]) data.audioUrl = `/uploads/${f.audioFile[0].filename}`;
    else if (req.body.audioUrl !== undefined) data.audioUrl = req.body.audioUrl || null;

    if (f.stemsFile?.[0]) data.stemsUrl = `/uploads/${f.stemsFile[0].filename}`;
    else if (req.body.stemsUrl !== undefined) data.stemsUrl = req.body.stemsUrl || null;

    // Allow admin to flip a beat back to live
    if (req.body.isSold !== undefined) {
      data.isSold = req.body.isSold === 'true' || req.body.isSold === true;
      if (!data.isSold) data.soldAt = null;
    }

    const beat = await prisma.beat.update({ where: { id }, data });
    res.json({ beat });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/beats/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.sale.deleteMany({ where: { beatId: req.params.id } });
    await prisma.beat.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Sales ----------
adminRouter.get('/sales', requireAdmin, async (_req, res, next) => {
  try {
    const sales = await prisma.sale.findMany({ orderBy: { createdAt: 'desc' }, include: { beat: true } });
    res.json({ sales });
  } catch (err) {
    next(err);
  }
});

// ---------- Stats ----------
adminRouter.get('/stats', requireAdmin, async (_req, res, next) => {
  try {
    const [totalSales, paidSales, totalBeats, soldBeats, revenueRows, exclusiveCount, inclusiveCount, recent] =
      await Promise.all([
        prisma.sale.count(),
        prisma.sale.count({ where: { paymentStatus: 'success' } }),
        prisma.beat.count(),
        prisma.beat.count({ where: { isSold: true } }),
        prisma.sale.aggregate({ where: { paymentStatus: 'success' }, _sum: { amountUsd: true } }),
        prisma.sale.count({ where: { licenseType: 'exclusive', paymentStatus: 'success' } }),
        prisma.sale.count({ where: { licenseType: 'inclusive', paymentStatus: 'success' } }),
        prisma.sale.findMany({ where: { paymentStatus: 'success' }, orderBy: { createdAt: 'desc' }, take: 5, include: { beat: true } }),
      ]);

    res.json({
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
    next(err);
  }
});