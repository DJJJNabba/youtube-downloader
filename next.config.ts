import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || '6379',
    CLEANUP_TOKEN: process.env.CLEANUP_TOKEN || 'default-cleanup-token',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Node.js modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
