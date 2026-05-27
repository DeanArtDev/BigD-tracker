import { CombinedGraphQLErrors } from '@apollo/client';
import { exceptionCode } from '@big-d/exceptions';
import { ApiError } from './api-error';
import { fromApolloError } from './converter';

function isUnauthorized(error: unknown): ApiError | null {
  if (CombinedGraphQLErrors.is(error)) {
    return fromApolloError(error).find((e) => e.code === exceptionCode.accountUnauthorized.code) ?? null;
  }
  return null;
}

function isRequestTimeout(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.code === exceptionCode.requestTimeout.code;
  }
  if (CombinedGraphQLErrors.is(error)) {
    return fromApolloError(error).some((e) => e.code === exceptionCode.requestTimeout.code);
  }
  return false;
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export { isUnauthorized, isRequestTimeout, isApiError };
