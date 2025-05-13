import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), tsconfigPaths(), tailwindcss()],
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
