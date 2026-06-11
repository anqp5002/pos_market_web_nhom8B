import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.55", "192.168.8.3", "26.185.168.56", "localhost"],
  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.1.55:3000", "192.168.8.3:3000", "26.185.168.56:3000", "localhost:3000"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '192.168.*.*',
      },
      {
        protocol: 'https',
        hostname: '**', // Fallback for external image URLs
      }
    ],
  },
};

export default nextConfig;
