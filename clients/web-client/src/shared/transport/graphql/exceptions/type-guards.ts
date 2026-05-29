import { CombinedGraphQLErrors } from '@apollo/client';
import { exceptionCode } from '@big-d/exceptions';
import { ApiError } from './api-error';
import { fromApolloError } from './converter';

function isUnauthorized(error: unknown): ApiError | null {
  if (isApiError(error) && error.code === exceptionCode.accountUnauthorized.code) {
    return error;
  }

  if (CombinedGraphQLErrors.is(error)) {
    return fromApolloError(error).find((e) => e.code === exceptionCode.accountUnauthorized.code) ?? null;
  }
  return null;
}

function isRequestTimeout(error: unknown): ApiError | null {
  if (isApiError(error) && error.code === exceptionCode.requestTimeout.code) {
    return error;
  }

  if (CombinedGraphQLErrors.is(error)) {
    return fromApolloError(error).find((e) => e.code === exceptionCode.requestTimeout.code) ?? null;
  }

  return null;
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export { isUnauthorized, isRequestTimeout, isApiError };
