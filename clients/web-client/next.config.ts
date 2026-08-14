import path from 'node:path';
import type { NextConfig } from 'next';
import { getEnvConfigServer } from '@/shared/lib/env-config.server';

const serverConfig = getEnvConfigServer();

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../..'),

  turbopack: {
    root: path.join(__dirname, '../..'),
  },

  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },

  rewrites: async () => {
    return [
      {
        source: '/api/graphql',
        destination: `${serverConfig.BACK_TO_BACK_URL}`,
      },
    ];
  },
};

export default nextConfig;
