/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@/entity/schema-types';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetTaskByIdInput = {
  id: string;
};

/** Частота повторения дела */
export type RecurrenceFrequency = 'DAILY' | 'HOURLY' | 'MINUTELY' | 'MONTHLY' | 'SECONDLY' | 'WEEKLY' | 'YEARLY';

export type TaskAssignInput = {
  groupId: number;
  taskId: string;
};

export type TaskCopyInput = {
  id: string;
};

export type TaskCreateInput = {
  deadline?: string | null | undefined;
  description?: string | null | undefined;
  groupId?: number | null | undefined;
  name: string;
  priority: number;
  startDate?: string | null | undefined;
};

export type TaskDeleteInput = {
  id: string;
};

export type TaskFinishInput = {
  id: string;
  reason?: string | null | undefined;
  type: TaskFinishStatus;
};

/** Статус завершения дела */
export type TaskFinishStatus = 'CANCELED' | 'COMPLETED' | 'OVERDUE';

/** День недели повторения дела */
export type TaskRecurrenceWeekday = 'FR' | 'MO' | 'SA' | 'SU' | 'TH' | 'TU' | 'WE';

export type TaskRecurrencyInput = {
  frequency: RecurrenceFrequency;
  interval?: number | null | undefined;
  monthdays?: Array<number> | null | undefined;
  startDate: string;
  untilDate?: string | null | undefined;
  weekdays?: Array<TaskRecurrenceWeekday> | null | undefined;
  yearmonths?: Array<number> | null | undefined;
};

/** Статусы дела */
export type TaskStatus = 'ARCHIVED' | 'CANCELED' | 'COMPLETED' | 'DELETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'OVERDUE';

export type TaskUnassignInput = {
  groupId: number;
  taskId: string;
};

export type TaskUpdateInput = {
  deadline?: string | null | undefined;
  description?: string | null | undefined;
  id: string;
  name: string;
  priority: number;
  recurrence?: TaskRecurrencyInput | null | undefined;
  startDate?: string | null | undefined;
  weight: number;
};

export type CreateTaskMutationVariables = Exact<{
  input: Types.TaskCreateInput;
}>;

export type CreateTaskMutation = {
  createTask: {
    id: string;
    name: string;
    description: string | null;
    deadline: string | null;
    priority: number;
    startDate: string | null;
    status: Types.TaskStatus;
    groupId: number | null;
  };
};

export type CopyTaskMutationVariables = Exact<{
  input: Types.TaskCopyInput;
}>;

export type CopyTaskMutation = { copyTask: { id: string } };

export type UpdateTaskMutationVariables = Exact<{
  input: Types.TaskUpdateInput;
}>;

export type UpdateTaskMutation = {
  updateTask: {
    id: string;
    name: string;
    description: string | null;
    deadline: string | null;
    priority: number;
    startDate: string | null;
    status: Types.TaskStatus;
  };
};

export type DeleteTaskMutationVariables = Exact<{
  input: Types.TaskDeleteInput;
}>;

export type DeleteTaskMutation = { deleteTask: { id: string } };

export type TaskAssignMutationVariables = Exact<{
  input: Types.TaskAssignInput;
}>;

export type TaskAssignMutation = { assignTaskToGroup: boolean };

export type TaskUnassignMutationVariables = Exact<{
  input: Types.TaskUnassignInput;
}>;

export type TaskUnassignMutation = { unassignTaskToGroup: boolean };

export type TaskFinishMutationVariables = Exact<{
  input: Types.TaskFinishInput;
}>;

export type TaskFinishMutation = { finishTask: { id: string; status: Types.TaskStatus; cancelReason: string | null } };

export type TaskByIdQueryVariables = Exact<{
  input: Types.GetTaskByIdInput;
}>;

export type TaskByIdQuery = {
  getTaskById: {
    id: string;
    name: string;
    description: string | null;
    priority: number;
    endDate: string | null;
    status: Types.TaskStatus;
    startDate: string | null;
    deadline: string | null;
    groupId: number | null;
  };
};

export const CreateTaskDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateTask' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'TaskCreateInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createTask' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'deadline' } },
                { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
                { kind: 'Field', name: { kind: 'Name', value: 'startDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'groupId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateTaskMutation, CreateTaskMutationVariables>;
export const CopyTaskDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CopyTask' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'TaskCopyInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'copyTask' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CopyTaskMutation, CopyTaskMutationVariables>;
export const UpdateTaskDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateTask' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'TaskUpdateInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateTask' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'deadline' } },
                { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
                { kind: 'Field', name: { kind: 'Name', value: 'startDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateTaskMutation, UpdateTaskMutationVariables>;
export const DeleteTaskDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteTask' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'TaskDeleteInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteTask' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteTaskMutation, DeleteTaskMutationVariables>;
export const TaskAssignDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'TaskAssign' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'TaskAssignInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assignTaskToGroup' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TaskAssignMutation, TaskAssignMutationVariables>;
export const TaskUnassignDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'TaskUnassign' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'TaskUnassignInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'unassignTaskToGroup' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TaskUnassignMutation, TaskUnassignMutationVariables>;
export const TaskFinishDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'TaskFinish' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'TaskFinishInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'finishTask' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cancelReason' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TaskFinishMutation, TaskFinishMutationVariables>;
export const TaskByIdDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'TaskById' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'GetTaskByIdInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getTaskById' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'priority' } },
                { kind: 'Field', name: { kind: 'Name', value: 'endDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'startDate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deadline' } },
                { kind: 'Field', name: { kind: 'Name', value: 'groupId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TaskByIdQuery, TaskByIdQueryVariables>;
