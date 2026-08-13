/**
 * Shared formatting rules for every package in the monorepo.
 *
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import('prettier').Config}
 */
const config = {
  singleQuote: true,
  arrowParens: 'always',
  useTabs: false,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 120,
  bracketSpacing: true,
  semi: true,
  endOfLine: 'lf',
};

export default config;
