import type { DocumentNode, OperationVariables, TypedDocumentNode } from '@apollo/client';
import type { Reference } from '@apollo/client/cache';
import { useMutation, useQuery } from '@apollo/client/react';
import { Override } from '@/shared/lib';

type AppQueryOptions<TData = unknown, TVariables extends OperationVariables = OperationVariables> = useQuery.Options<
  NoInfer<TData>,
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

type AppMutationOptionsResponse<TData = unknown, TVariables extends OperationVariables = OperationVariables> = [
  DocumentNode | TypedDocumentNode<TData, TVariables>,
  AppMutationOptions<TData, TVariables>,
];

type WithReferenceList<T, K extends keyof T> = Override<T, { [P in K]: Reference[] }>;

export type { AppQueryOptions, AppQueryOptionsResponse, WithReferenceList, AppMutationOptionsResponse };
