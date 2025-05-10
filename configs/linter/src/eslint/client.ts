import type { Linter } from 'eslint';

const getClientEslintConfig = (): Linter.LegacyConfig => {
  return {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react-hooks/recommended',
      'prettier',
      'plugin:import/recommended',
    ],
    parser: '@typescript-eslint/parser',
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    plugins: ['react-refresh'],
    rules: {
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
      'no-empty-function': 'off',
      'no-restricted-exports': 'off',
      'no-undef': 'off',
      'operator-linebreak': 'off',
      'no-promise-executor-return': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'brace-style': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowTernary: true, allowShortCircuit: true },
      ],
    },
  };
};

export { getClientEslintConfig };
