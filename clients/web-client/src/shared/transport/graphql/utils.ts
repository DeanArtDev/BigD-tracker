import { ErrorLike } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { ApiErrorCode, fromApolloError } from './exceptions';

function useExtendApolloErrorResult(error: ErrorLike | undefined) {
  const appErrors = useMemo(() => fromApolloError(error), [error]);

  return {
    isError: appErrors.length > 0,
    appErrors,
    hasError: useCallback(({ code }: { code: ApiErrorCode }) => appErrors.some((e) => e.code === code), [appErrors]),
    firstError: useCallback(({ code }: { code: ApiErrorCode }) => appErrors.find((e) => e.code === code), [appErrors]),
  };
}

export { useExtendApolloErrorResult };
