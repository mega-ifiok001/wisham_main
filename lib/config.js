// WISHAM server configuration (server-side only — never imported by client components)

export const config = {
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL,
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
  paystackCurrency: process.env.PAYSTACK_CURRENCY || 'NGN',
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || 'WISHAM <onboarding@resend.dev>',
  adminEmail: process.env.ADMIN_EMAIL || 'ifiokaniebiet@gmail.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'wisham-admin-2026',
  jwtSecret: process.env.JWT_SECRET || 'wisham-dev-secret',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'wisham',
  },
};

export function cloudinaryConfigured() {
  return Boolean(
    config.cloudinary.cloudName &&
      config.cloudinary.apiKey &&
      config.cloudinary.apiSecret
  );
}