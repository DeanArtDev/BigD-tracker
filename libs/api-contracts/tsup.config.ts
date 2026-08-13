import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  // Keep CJS on esbuild: tsup's treeshake mode routes it through Rollup,
  // which breaks runtime exports emitted from TypeScript namespaces.
  platform: 'node',
  target: 'node24',
  // rrule publishes an ESM entry without declaring the package as ESM;
  // bundle it so Node can load both generated formats reliably.
  noExternal: ['rrule'],
  outExtension: () => ({ js: '.cjs' }),
});
