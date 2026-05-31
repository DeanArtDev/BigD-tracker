/// <reference types="vitest" />

import path from 'node:path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  test: {
    environment: 'jsdom',

    globals: true,

    setupFiles: ['./vitest.setup.ts'],

    css: true,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
