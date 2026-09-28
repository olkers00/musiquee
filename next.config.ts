import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Spotify's OAuth redirect URI requires 127.0.0.1 (it no longer accepts
  // "localhost"), so the dev server needs to trust that origin too.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

export default nextConfig;