import type { Environment } from '@big-d/observability';
import type { GraphQLFormattedError } from 'graphql';
import { formatGraphqlError } from './format-graphql-error';

const error: GraphQLFormattedError = {
  message: 'Task infrastructure error',
  path: ['getInbox'],
  locations: [{ line: 2, column: 3 }],
  extensions: {
    key: 'TASK_INFRASTRUCTURE_ERROR',
    code: 'GT-I-0000',
    correlationId: 'cid-123',
    message: 'Task infrastructure error',
    operation: 'inbox-group.get-inbox-by-user-id-with-tasks',
    timestamp: '2026-08-12T16:16:20.457Z',
    stacktrace: ['GraphQLError: Task infrastructure error', 'at GraphQLExceptionFilter.catch'],
  },
};

describe('formatGraphqlError', () => {
  it('keeps the complete error response in local environment', () => {
    expect(formatGraphqlError(error, 'local')).toBe(error);
  });

  it.each<Environment>(['test', 'dev-stage', 'production'])(
    'returns only public fields in %s environment',
    (environment) => {
      expect(formatGraphqlError(error, environment)).toEqual({
        message: 'Task infrastructure error',
        path: ['getInbox'],
        locations: [{ line: 2, column: 3 }],
        extensions: {
          key: 'TASK_INFRASTRUCTURE_ERROR',
          code: 'GT-I-0000',
          correlationId: 'cid-123',
        },
      });
    },
  );
});
