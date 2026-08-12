import type { Environment } from '@big-d/observability';
import type { GraphQLFormattedError } from 'graphql';

const PUBLIC_EXTENSION_FIELDS = ['key', 'code', 'correlationId'] as const;

function formatGraphqlError(error: GraphQLFormattedError, environment: Environment): GraphQLFormattedError {
  if (environment === 'local') return error;

  return {
    message: error.message,
    path: error.path,
    locations: error.locations,
    extensions: Object.fromEntries(
      PUBLIC_EXTENSION_FIELDS.flatMap((field) => {
        const value = error.extensions?.[field];
        return value === undefined ? [] : [[field, value]];
      }),
    ),
  };
}

export { formatGraphqlError };
