import globals from 'globals';
import { getServiceApiEslintConfig } from '@big-d/linter';

export default getServiceApiEslintConfig(
  {
    ignores: ['eslint.config.mjs', './src/db-types.ts'],
  },

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
