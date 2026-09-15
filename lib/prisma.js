import { PrismaClient } from '@prisma/client';

// Reuse a single Prisma client across hot reloads / serverless invocations
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__wishamPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__wishamPrisma = prisma;
}

export default prisma;