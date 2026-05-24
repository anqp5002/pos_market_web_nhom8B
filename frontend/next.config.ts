import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.8.3", "26.185.168.56", "localhost"],
  experimental: {
    serverActions: {
      allowedOrigins: ["192.168.8.3:3000", "26.185.168.56:3000", "localhost:3000"],
    },
  },
};

export default nextConfig;
