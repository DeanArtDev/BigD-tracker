import type { OperationVariables } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type { DocumentNode } from 'graphql';
import { useCallback, useMemo } from 'react';
import { ApiError, ApiErrorCode, fromApolloError } from './exceptions';
import { GraphQLRequestContext } from './request-context';

type AppQueryResult<TData, TVariables extends OperationVariables = OperationVariables> = Omit<
  useQuery.Result<TData, TVariables, 'empty' | 'complete' | 'streaming', Partial<TVariables>>,
  'error'
> & {
  errors: ApiError[];
  hasError: ({ code }: { code: ApiErrorCode }) => boolean;
  firstError: ({ code }: { code: ApiErrorCode }) => ApiError | undefined;
};

type AppQueryOptions<TData, TVars extends OperationVariables = OperationVariables> = Partial<GraphQLRequestContext> &
  useQuery.Options<TData, TVars>;

function useAppQuery<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode,
  queryOptions: AppQueryOptions<TData, TVariables>,
): AppQueryResult<TData, TVariables> {
  const { endpoint, context } = queryOptions;

  const { error, ...result } = useQuery<TData, TVariables>(query, {
    ...queryOptions,
    context: {
      ...context,
      endpoint: endpoint,
    },
  });

  const appErrors = useMemo(() => fromApolloError(error), [error]);

  return {
    ...result,
    errors: appErrors,
    hasError: useCallback(({ code }) => appErrors.some((e) => e.code === code), [appErrors]),
    firstError: useCallback(({ code }) => appErrors.find((e) => e.code === code), [appErrors]),
  };
}

export { useAppQuery };
