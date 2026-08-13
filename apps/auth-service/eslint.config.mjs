import { createApiServiceEslintConfig } from '@big-d/configs-linter';

export default createApiServiceEslintConfig({
  tsconfigRootDir: import.meta.dirname,
  ignores: ['src/infrastructure/types.d.ts'],
  rules: {
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
  },
});
