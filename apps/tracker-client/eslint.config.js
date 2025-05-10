import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import reactQuery from '@tanstack/eslint-plugin-query';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import { getClientEslintConfig } from '@big-d/linter';

export default tseslint.config(
  { ignores: ['dist'] },

  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    settings: getClientEslintConfig().settings,
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
    },

    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'react-query': reactQuery,
      '@typescript-eslint': tseslint.plugin,
      import: importPlugin,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,
      ...prettierConfig.rules,
      ...getClientEslintConfig().rules,
    },
  },
);
