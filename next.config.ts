import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        pathname: '/maps/api/staticmap**',
      },
    ],
  },
};

export default nextConfig;
