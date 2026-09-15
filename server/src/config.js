import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
  paystackCurrency: process.env.PAYSTACK_CURRENCY || 'NGN',
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || 'WISHAM <onboarding@resend.dev>',
  adminEmail: process.env.ADMIN_EMAIL || 'ifiokaniebiet@gmail.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'wisham-admin-2026',
  jwtSecret: process.env.JWT_SECRET || 'wisham-dev-secret',
};

// Paystack: amount is always charged in the smallest currency subunit
// USD -> cents (100), NGN -> kobo (100), GHS -> pesewas, ZAR -> cents
export const CURRENCY_SUBUNIT = 100;

export function toSubunit(amount) {
  return Math.round(amount * CURRENCY_SUBUNIT);
}