import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import * as path from 'node:path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    preview: {
      open: true,
      host: true,
      port: parseInt(env.VITE_CLIENT_PORT ?? '', 10) || 5173,
    },
    server: {
      watch: {
        usePolling: true,
      },
      host: true,
      open: false,
      port: parseInt(env.VITE_CLIENT_PORT ?? '', 10) || 5173,
    },
  };
});
