import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Prisma ships native query engines — keep it out of the bundler
  serverExternalPackages: ['@prisma/client', 'prisma'],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;