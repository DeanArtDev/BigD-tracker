import { GraphQLError } from 'graphql';

class AppGraphQLError extends GraphQLError {
  constructor(opts: {
    key: string;
    code: string;
    message: string;
    correlationId: string;
    details: { [key: string]: unknown };
  }) {
    super(opts.message ?? opts.details.message, {
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
