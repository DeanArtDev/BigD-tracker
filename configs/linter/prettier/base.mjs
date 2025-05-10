/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const baseConfig = {
  singleQuote: true,
  arrowParens: 'always',
  useTabs: false,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 90,
  bracketSpacing: true,
  semi: true,
  endOfLine: 'lf',
};

export default baseConfig;
