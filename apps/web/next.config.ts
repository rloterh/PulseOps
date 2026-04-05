import type { NextConfig } from 'next';
import { securityHeaders } from './src/lib/security/headers';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@pulseops/env',
    '@pulseops/supabase',
    '@pulseops/ui',
    '@pulseops/utils',
  ],
  typedRoutes: true,
  headers() {
    return Promise.resolve([
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]);
  },
};

export default nextConfig;
