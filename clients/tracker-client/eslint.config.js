import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import reactQuery from '@tanstack/eslint-plugin-query';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

const clientSettings = {
  'import/resolver': {
    typescript: {
      alwaysTryTypes: true,
    },
  },
};

const clientRules = {
  '@typescript-eslint/consistent-type-definitions': ['error'],
  'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  'import/no-cycle': ['error', { ignoreExternal: true }],
  'linebreak-style': 'off',
  'import/named': 'off',
  'implicit-arrow-linebreak': 'off',
  'function-paren-newline': 'off',
  'no-console': 'off',
  'no-confusing-arrow': 'off',
  indent: 'off',
  'import/no-unresolved': 'off',
  'import/prefer-default-export': 'off',
  'import/extensions': ['error', { tsx: 'never', ts: 'never' }],
  'react/jsx-no-useless-fragment': 'off',
  'no-restricted-syntax': 'off',
  'no-shadow': 'off',
  'consistent-return': 'off',
  '@typescript-eslint/consistent-type-assertions': 'off',
  'object-curly-newline': 'off',
  'react/react-in-jsx-scope': 'off',
  'import/no-extraneous-dependencies': 'off',
  'no-useless-constructor': 'off',
  'no-useless-assignment': 'off',
  'no-empty-function': 'off',
  'no-restricted-exports': 'off',
  'no-undef': 'off',
  'operator-linebreak': 'off',
  'no-promise-executor-return': 'off',
  '@typescript-eslint/no-namespace': 'off',
  'brace-style': 'off',
  '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true, allowShortCircuit: true }],
};

export default tseslint.config(
  { ignores: ['dist'] },

  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}', '**/*.{js,jsx}'],
    settings: clientSettings,
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
      'import': importPlugin,
      'prettier': prettierPlugin,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,
      ...prettierConfig.rules,
      ...clientRules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'all',
          caughtErrors: 'all',
          ignoreRestSiblings: false,

          varsIgnorePattern: '^(_|__|___)$',
          argsIgnorePattern: '^(_|__|___)$',
          caughtErrorsIgnorePattern: '^(_|__|___)$',
          destructuredArrayIgnorePattern: '^(_|__|___)$',
        },
      ],
    },
  },
);
