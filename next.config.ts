import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '10073',
      },
      {
        protocol: 'https',
        hostname: 'ivory-bat-745340.hostingersite.com',
      },

      {
        protocol: 'http',
        hostname: 'localhost',
        port: '10073',
      },
      {
        protocol: 'https',
        hostname: 'cornflowerblue-crane-660265.hostingersite.com',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
