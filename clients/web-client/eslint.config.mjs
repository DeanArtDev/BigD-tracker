import { createEslintExtension } from '@big-d/configs-linter';
import { fixupConfigRules } from '@eslint/compat';
import { globalIgnores, defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  ...fixupConfigRules(nextVitals),
  ...fixupConfigRules(nextTs),

  prettierConfig,

  {
    ...createEslintExtension({
      rules: {
        'react-hooks/refs': 'off',
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
            pathGroups: [
              {
                pattern: '@/**',
                group: 'internal',
                position: 'before',
              },
            ],

            pathGroupsExcludedImportTypes: ['builtin'],

            distinctGroup: false,

            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
          },
        ],
      },
    }),
  },

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'src/**/*.generated.ts']),
]);
