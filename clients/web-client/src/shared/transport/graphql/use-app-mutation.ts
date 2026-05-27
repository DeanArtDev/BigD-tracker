import type { OperationVariables } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { DocumentNode } from 'graphql';
import { useCallback, useMemo } from 'react';
import { ApiError, ApiErrorCode, fromApolloError } from './exceptions';
import { GraphQLRequestContext } from './request-context';

type AppMutationResult<TData, TVar extends OperationVariables = OperationVariables> = Omit<
  useMutation.ResultTuple<TData, TVar>[1],
  'error'
> & {
  errors: ApiError[];
  hasError: ({ code }: { code: ApiErrorCode }) => boolean;
  firstError: ({ code }: { code: ApiErrorCode }) => ApiError | undefined;
};

type AppMutationOptions<TData, TVars extends OperationVariables = OperationVariables> = useMutation.Options<
  TData,
  TVars
> &
  GraphQLRequestContext;

function useAppMutation<TData, TVars extends OperationVariables = OperationVariables>(
  mutation: DocumentNode,
  { endpoint, context, ...options }: AppMutationOptions<TData, TVars> = { endpoint: 'private' },
): [useMutation.ResultTuple<TData, TVars>[0], AppMutationResult<TData, TVars>] {
  const [mutate, { error, ...result }] = useMutation<TData, TVars>(mutation, {
    ...options,
    context: { ...context, endpoint },
  });

  const appErrors = useMemo(() => fromApolloError(error), [error]);

  return [
    mutate,
    {
      ...result,
      errors: appErrors,
      hasError: useCallback(({ code }) => appErrors.some((e) => e.code === code), [appErrors]),
      firstError: useCallback(({ code }) => appErrors.find((e) => e.code === code), [appErrors]),
    },
  ];
}

export { useAppMutation };
