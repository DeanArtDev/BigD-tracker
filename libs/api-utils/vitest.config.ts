import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['./setup-tests.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
