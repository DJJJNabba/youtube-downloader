import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  env: {
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || '6379',
    CLEANUP_TOKEN: process.env.CLEANUP_TOKEN || 'default-cleanup-token',
  },
};

export default nextConfig;
