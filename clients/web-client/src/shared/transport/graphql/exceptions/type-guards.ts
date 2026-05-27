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
  if (CombinedGraphQLErrors.is(error)) {
    return fromApolloError(error).some((e) => e.code === exceptionCode.requestTimeout.code);
  }
  return false;
}

export { isUnauthorized, isRequestTimeout };
