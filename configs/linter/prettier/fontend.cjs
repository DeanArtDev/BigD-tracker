const baseConfig = require('./base.cjs');

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const frontendConfig = {
  ...baseConfig,
  bracketSameLine: false,
  quoteProps: 'consistent',
  proseWrap: 'always',
  bracketSpacing: true,
  jsxSingleQuote: false,
  singleAttributePerLine: false,
};

module.exports = frontendConfig;
