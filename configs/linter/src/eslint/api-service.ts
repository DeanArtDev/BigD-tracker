import * as eslint from '@eslint/js';
import * as eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import * as globals from 'globals';
import tseslint, { type ConfigArray, type FlatConfig } from 'typescript-eslint';
import { createEslintExtension } from './extension';

interface ApiServiceEslintConfigOptions {
  readonly tsconfigRootDir: string;
  readonly ignores?: readonly string[];
  readonly rules?: FlatConfig.Rules;
}

function createApiServiceEslintConfig({
  tsconfigRootDir,
  ignores = [],
  rules = {},
}: ApiServiceEslintConfigOptions): ConfigArray {
  const extension = createEslintExtension({
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      ...rules,
    },
  });

  return tseslint.config(
    {
      ignores: ['eslint.config.mjs', 'dist/**', ...ignores],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        sourceType: 'module',
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      plugins: extension.plugins,
      rules: extension.rules,
    },
  );
}

export { createApiServiceEslintConfig, type ApiServiceEslintConfigOptions };
