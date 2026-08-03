import type { DocumentNode, OperationVariables, TypedDocumentNode } from '@apollo/client';
import type { Reference } from '@apollo/client/cache';
import { useLazyQuery, useMutation, useQuery, useSuspenseQuery } from '@apollo/client/react';
import { AnyObject } from '@/shared/lib';

type AppQueryOptions<TData = unknown, TVariables extends OperationVariables = OperationVariables> = useQuery.Options<
  NoInfer<TData>,
  NoInfer<TVariables>
>;

type AppSuspenseQueryOptions<TVariables extends OperationVariables = OperationVariables> = useSuspenseQuery.Options<
  NoInfer<TVariables>
>;

type AppMutationOptions<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
> = useMutation.Options<NoInfer<TData>, NoInfer<TVariables>>;

type AppQueryOptionsResponse<TData = unknown, TVariables extends OperationVariables = OperationVariables> = [
  DocumentNode | TypedDocumentNode<TData, TVariables>,
  AppQueryOptions<TData, TVariables>,
];

type AppSuspenseQueryOptionsResponse<TData = unknown, TVariables extends OperationVariables = OperationVariables> = [
  DocumentNode | TypedDocumentNode<TData, TVariables>,
  AppSuspenseQueryOptions<TVariables>,
];

type AppLazyQueryOptionsResponse<TVariables extends OperationVariables = OperationVariables> = useLazyQuery.ExecOptions<
  NoInfer<TVariables>
>;

type AppQueryOptionsResponseMap<TData = unknown, TVariables extends OperationVariables = OperationVariables> = {
  query: AppQueryOptionsResponse<TData, TVariables>;
  suspense: AppSuspenseQueryOptionsResponse<TData, TVariables>;
  lazy: AppLazyQueryOptionsResponse<TVariables>;
};

type AppMutationOptionsResponse<TData = unknown, TVariables extends OperationVariables = OperationVariables> = [
  DocumentNode | TypedDocumentNode<TData, TVariables>,
  AppMutationOptions<TData, TVariables>,
];

type WithReferenceList<T extends AnyObject, K extends keyof T> = Omit<T, K> & {
  [P in K]: Reference[];
};

export type {
  AppLazyQueryOptionsResponse,
  AppMutationOptionsResponse,
  AppQueryOptionsResponse,
  AppQueryOptionsResponseMap,
  AppSuspenseQueryOptionsResponse,
  WithReferenceList,
};
