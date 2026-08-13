import type { FlatConfig } from 'typescript-eslint';
import * as unusedImports from 'eslint-plugin-unused-imports';

interface EslintExtensionOptions {
  readonly plugins?: FlatConfig.Plugins;
  readonly rules?: FlatConfig.Rules;
}

interface EslintExtension {
  readonly plugins: FlatConfig.Plugins;
  readonly rules: FlatConfig.Rules;
}

const basePlugins: FlatConfig.Plugins = {
  'unused-imports': unusedImports,
};

const baseRules: FlatConfig.Rules = {
  'no-useless-assignment': 'off',
  'unused-imports/no-unused-imports': 'error',
};

function createEslintExtension({ plugins = {}, rules = {} }: EslintExtensionOptions = {}): EslintExtension {
  return {
    plugins: {
      ...basePlugins,
      ...plugins,
    },
    rules: {
      ...baseRules,
      ...rules,
    },
  };
}

export { createEslintExtension, type EslintExtension, type EslintExtensionOptions };
