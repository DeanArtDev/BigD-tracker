import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import * as path from 'node:path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    esbuild: { keepNames: true },
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['/icons/favicon.svg', '/icons/favicon.ico', '/icons/favicon-96x96.png'],
        manifest: {
          lang: 'ru',
          description: 'Трекинг всего и вся',
          name: 'Tracker',
          short_name: 'Planner',
          start_url: '/?source=pwa',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#fff',
          theme_color: '#ffffff',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
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
      strictPort: true,
    },
  };
});
