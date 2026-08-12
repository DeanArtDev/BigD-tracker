import { GraphQLError } from 'graphql';

class AppGraphQLError extends GraphQLError {
  constructor(opts: {
    key: string;
    code: string;
    message: string;
    correlationId: string;
    details: { [key: string]: unknown };
    originalError?: Error;
  }) {
    super(opts.message ?? opts.details.message, {
      originalError: opts.originalError,
      extensions: {
        key: opts.key,
        code: opts.code,
        correlationId: opts.correlationId,
        ...opts.details,
      },
    });
  }
}

export { AppGraphQLError };
