/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@/entity/schema-types';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetAssignableTasksInput = {
  /** Исключает дела в этих группах из выдачи */
  groupIds?: Array<number> | null | undefined;
  search: string;
};

/** Приоритеты дела */
export type TaskPriority = 'Delegate' | 'Delete' | 'Do' | 'Plan';

export type GetAssignableTasksQueryVariables = Exact<{
  input: Types.GetAssignableTasksInput;
}>;

export type GetAssignableTasksQuery = {
  getAssignableTasks: Array<{ id: string; name: string; groupId: number | null; priority: Types.TaskPriority }>;
};

export const GetAssignableTasksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAssignableTasks' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'GetAssignableTasksInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getAssignableTasks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'groupId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAssignableTasksQuery, GetAssignableTasksQueryVariables>;
