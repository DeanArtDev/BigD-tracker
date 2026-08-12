import globals from 'globals';
import { getServiceApiEslintConfig } from '@big-d/linter';

export default getServiceApiEslintConfig(
  {
    ignores: ['dist/**'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
