import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    turbo: {
      resolveAlias: {
        // Add path aliases
        '@/*': './src/*',
      },
    },
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'encoding');
    return config;
  },
  eslint: {
    dirs: ['src', '!src/generated/**'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'twimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'jsvlucpate6dhs1u.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'USL9gCF3ZobA2MDG.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
