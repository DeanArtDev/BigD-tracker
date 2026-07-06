import { CodegenConfig } from '@graphql-codegen/cli';
import { getEnvConfigClient } from './src/shared/lib/env-config.client';

const envConfit = getEnvConfigClient();

const config: CodegenConfig = {
  schema: envConfit.NEXT_PUBLIC_HTTP_API_URL,
  documents: ['./src/**/*.{tsx,ts}'],
  generates: {
    './src/entity/schema-types.ts': {
      plugins: ['typescript'],
    },
    'src/': {
      preset: 'near-operation-file',
      presetConfig: {
        baseTypesPath: '~@/entity/schema-types',
        extension: '.generated.ts',
      },
      plugins: ['typescript-operations', 'typed-document-node'],
    },
  },
};

export default config;
