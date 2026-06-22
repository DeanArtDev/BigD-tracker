import path from 'node:path';
import type { NextConfig } from 'next';
import { getEnvConfigClient } from './src/shared/lib/env-config.client';

const clientConfig = getEnvConfigClient();

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, '../..'),
  },

  rewrites: async () => {
    return [
      {
        source: '/api/graphql',
        destination: `${clientConfig.NEXT_PUBLIC_HTTP_API_URL}`,
      },
    ];
  },
};

export default nextConfig;
