import { CodegenConfig } from '@graphql-codegen/cli';
import { getEnvConfigClient } from './src/shared/lib/env-config.client';

const envConfit = getEnvConfigClient();

function makeIncrementalTypeLocal(_: string, content: string): string {
  return content
    .replace('export type Incremental<T>', 'type Incremental<T>')
    .replace('export type TaskPriority', 'type TaskPriority')
    .replace('export type TaskStatus', 'type TaskStatus')
    .replace('export type GroupTaskOrder', 'type GroupTaskOrder')
    .replace('export type GroupStatus', 'type GroupStatus');
}

const config: CodegenConfig = {
  schema: envConfit.NEXT_PUBLIC_HTTP_API_URL,
  documents: ['./src/**/*.{tsx,ts}'],
  hooks: {
    beforeOneFileWrite: makeIncrementalTypeLocal,
  },
  generates: {
    './src/shared/transport/graphql/schema-types.ts': {
      plugins: ['typescript'],
    },
    'src/': {
      preset: 'near-operation-file',
      presetConfig: {
        baseTypesPath: `~@/shared/transport/graphql/schema-types`,
        extension: '.generated.ts',
      },
      plugins: ['typescript-operations', 'typed-document-node'],
    },
  },
};

export default config;
