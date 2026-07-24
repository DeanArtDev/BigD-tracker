/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@/entity/schema-types';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetGroupInput = {
  groupId: number;
};

export type GetGroupTasksInput = {
  order?: GroupTaskOrder | null | undefined;
};

/** Статусы группы */
export type GroupStatus = 'DONE' | 'IN_PROGRESS' | 'NOT_STARTED';

/** Порядок дел внутри группы */
export type GroupTaskOrder = 'Group';

/** Приоритеты дела */
export type TaskPriority = 'Delegate' | 'Delete' | 'Do' | 'Plan';

/** Статусы дела */
export type TaskStatus = 'ARCHIVED' | 'CANCELED' | 'COMPLETED' | 'DELETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'OVERDUE';

export type GetDetailedGroupByIdQueryVariables = Exact<{
  input: Types.GetGroupInput;
  tasksInput?: Types.GetGroupTasksInput | null | undefined;
}>;

export type GetDetailedGroupByIdQuery = {
  getGroup: {
    id: number;
    name: string;
    description: string | null;
    status: Types.GroupStatus;
    progress: number;
    tasks: {
      items: Array<{
        id: string;
        name: string;
        status: Types.TaskStatus;
        priority: Types.TaskPriority;
        description: string | null;
        startDate: string | null;
        deadline: string | null;
        endDate: string | null;
        cancelReason: string | null;
        groupId: number | null;
      }>;
    };
  };
};

export const GetDetailedGroupByIdDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetDetailedGroupById' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'GetGroupInput' } } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'tasksInput' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'GetGroupTasksInput' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getGroup' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'progress' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'tasks' },
                  arguments: [
                    {
                      kind: 'Argument',
                      name: { kind: 'Name', value: 'input' },
                      value: { kind: 'Variable', name: { kind: 'Name', value: 'tasksInput' } },
                    },
                  ],
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'items' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'startDate' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'deadline' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'endDate' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'cancelReason' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'groupId' } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetDetailedGroupByIdQuery, GetDetailedGroupByIdQueryVariables>;
