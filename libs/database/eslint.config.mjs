import { createApiServiceEslintConfig } from '@big-d/configs-linter';

export default createApiServiceEslintConfig({
  tsconfigRootDir: import.meta.dirname,
  ignores: ['src/db-types.ts'],
});
