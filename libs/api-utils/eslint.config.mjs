import { createApiServiceEslintConfig } from '@big-d/configs-linter';

export default createApiServiceEslintConfig({
  tsconfigRootDir: import.meta.dirname,
  ignores: ['src/types.d.ts'],
  rules: { '@typescript-eslint/no-redundant-type-constituents': 'off' },
});
