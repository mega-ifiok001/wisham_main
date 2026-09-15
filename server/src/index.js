import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import prisma from './prisma.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';

const app = express();

// CORS — allow our frontend origin(s)
const allowedOrigins = [config.appUrl, 'http://localhost:5173', 'http://localhost:4173'];
app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin (curl / server-to-server) requests without Origin header
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);

// JSON body parser that captures the raw body for Paystack webhook signature verification
app.use(
  express.json({
    limit: '12mb',
    verify: (req, _res, buf) => {
      try {
        req.rawBody = buf.toString('utf8');
      } catch {
        req.rawBody = '';
      }
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---- Routes ----
app.use('/api', publicRouter);
app.use('/api/admin', adminRouter);

// ---- Error handler ----
app.use((err, _req, res, _next) => {
  console.error('API error:', err);
  const status = err.status || err.statusCode || (err.code === 'PAYMENT_FAILED' ? 402 : err.code === 'SALE_NOT_FOUND' ? 404 : 500);
  res.status(status).json({
    error: err.expose ? err.message : err.code === 'PAYMENT_FAILED' ? err.message : 'Internal server error',
  });
});

const server = app.listen(config.port, () => {
  console.log(`⚡ WISHAM API listening on http://localhost:${config.port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});