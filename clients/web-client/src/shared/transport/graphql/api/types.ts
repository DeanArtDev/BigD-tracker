import type { DocumentNode, OperationVariables, TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

type AppQueryOptions<TData = unknown, TVariables extends OperationVariables = OperationVariables> = useQuery.Options<
  NoInfer<TData>,
  NoInfer<TVariables>
>;

type AppQueryOptionsResponse<TData = unknown, TVariables extends OperationVariables = OperationVariables> = [
  DocumentNode | TypedDocumentNode<TData, TVariables>,
  AppQueryOptions<TData, TVariables>,
];

export type { AppQueryOptions, AppQueryOptionsResponse };
