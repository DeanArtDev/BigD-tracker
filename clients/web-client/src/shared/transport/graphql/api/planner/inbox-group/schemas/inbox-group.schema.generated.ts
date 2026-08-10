/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@/shared/transport/graphql/schema-types';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetInboxTasksInput = {
  cursor?: string | null | undefined;
  limit: number;
  priority?: Array<TaskPriority> | null | undefined;
  search?: string | null | undefined;
  status?: Array<TaskStatus> | null | undefined;
};

/** Частота повторения дела */
export type RecurrenceFrequency = 'DAILY' | 'HOURLY' | 'MINUTELY' | 'MONTHLY' | 'SECONDLY' | 'WEEKLY' | 'YEARLY';

/** Приоритеты дела */
type TaskPriority = 'Delegate' | 'Delete' | 'Do' | 'Plan';

/** День недели повторения дела */
export type TaskRecurrenceWeekday = 'FR' | 'MO' | 'SA' | 'SU' | 'TH' | 'TU' | 'WE';

/** Статусы дела */
type TaskStatus = 'ARCHIVED' | 'CANCELED' | 'COMPLETED' | 'DELETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'OVERDUE';

export type GetInboxQueryVariables = Exact<{
  input?: Types.GetInboxTasksInput | null | undefined;
}>;

export type GetInboxQuery = {
  getInbox: {
    id: number;
    name: string;
    tasks: {
      meta: { endCursor: string | null; hasNextPage: boolean };
      items: Array<{
        id: string;
        name: string;
        description: string | null;
        priority: Types.TaskPriority;
        status: Types.TaskStatus;
        groupId: number | null;
        deadline: string | null;
        startDate: string | null;
        endDate: string | null;
        cancelReason: string | null;
        recurrence: {
          frequency: Types.RecurrenceFrequency;
          weekdays: Array<Types.TaskRecurrenceWeekday> | null;
          monthdays: Array<number> | null;
          untilDate: string | null;
          startDate: string;
        } | null;
      }>;
    };
  };
};

export const GetInboxDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetInbox' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'GetInboxTasksInput' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getInbox' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'tasks' },
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
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'meta' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'endCursor' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'hasNextPage' } },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'items' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TaskFragment' } }],
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
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TaskFragment' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'TaskSchema' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'groupId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'deadline' } },
          { kind: 'Field', name: { kind: 'Name', value: 'startDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'endDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'cancelReason' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recurrence' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
                { kind: 'Field', name: { kind: 'Name', value: 'weekdays' } },
                { kind: 'Field', name: { kind: 'Name', value: 'monthdays' } },
                { kind: 'Field', name: { kind: 'Name', value: 'untilDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'startDate' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetInboxQuery, GetInboxQueryVariables>;
