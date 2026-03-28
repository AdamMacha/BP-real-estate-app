import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd18-a.sdn.cz',
      },
      {
        protocol: 'https',
        hostname: '*.sdn.cz',
      },
      {
        protocol: 'https',
        hostname: '*.bezrealitky.cz',
      },
      {
        protocol: 'https',
        hostname: 'www.bezrealitky.cz',
      },
    ],
  },
};

export default nextConfig;

