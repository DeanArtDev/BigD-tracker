import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts', 'src/pino/index.ts', 'src/nest/index.ts'],
  format: ['cjs'],
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  platform: 'node',
  target: 'node24',
  onSuccess: options.watch ? 'pnpm build:types' : undefined,
  outExtension: () => ({ js: '.cjs' }),
}));
