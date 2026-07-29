import type { ErrorLike } from '@apollo/client';
import { ApolloLink } from '@apollo/client/link';
import { RetryLink } from '@apollo/client/link/retry';
import { exceptionCode } from '@big-d/exceptions';
import { ApiError } from '../exceptions/api-error';

const retryableErrorCodes = new Set<string>([
  exceptionCode.requestTimeout.code,
  exceptionCode.invalidRpcResponse.code,
  exceptionCode.serviceUnavailable.code,
  exceptionCode.internalGateway.code,
  exceptionCode.requestDataValidation.code,
]);

const retryByExceptionCodeLink = new RetryLink({
  delay: {
    initial: 5000,
    max: 10000,
    jitter: true,
  },

  attempts(attempt: number, operation: ApolloLink.Operation, error: ErrorLike) {
    if (operation == null) return false;
    if (error instanceof ApiError) return retryableErrorCodes.has(error.code) && attempt < 3;
    return false;
  },
});

export { retryByExceptionCodeLink };
