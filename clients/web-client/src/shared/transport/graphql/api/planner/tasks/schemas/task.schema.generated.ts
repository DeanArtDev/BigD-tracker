/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@/shared/transport/graphql/schema-types';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetAssignableTasksInput = {
  /** Исключает дела в этих группах из выдачи */
  groupIds?: Array<number> | null | undefined;
  search: string;
};

export type GetDiaryTasksInput = {
  /** Начало диапазона дат */
  from: string;
  /** IDs групп */
  group?: Array<number> | null | undefined;
  /** Конец диапазона дат */
  to: string;
};

export type GetTaskByIdInput = {
  id: string;
};

export type GetTasksCursorInput = {
  cursor?: string | null | undefined;
  groupIds?: Array<number> | null | undefined;
  ids?: Array<string> | null | undefined;
  limit: number;
  priority?: Array<TaskPriority> | null | undefined;
  search?: string | null | undefined;
  status?: Array<TaskStatus> | null | undefined;
};

export type GetTasksPerPageInput = {
  groupIds?: Array<number> | null | undefined;
  ids?: Array<string> | null | undefined;
  page: number;
  perPage: number;
  priority?: Array<TaskPriority> | null | undefined;
  recurring?: boolean | null | undefined;
  search?: string | null | undefined;
  sort?: GetTasksPerPageSortInput | null | undefined;
  status?: Array<TaskStatus> | null | undefined;
};

export type GetTasksPerPageSortInput = {
  deadline?: SortDirection | null | undefined;
  priority?: SortDirection | null | undefined;
  startDate?: SortDirection | null | undefined;
};

/** Частота повторения дела */
export type RecurrenceFrequency = 'DAILY' | 'HOURLY' | 'MINUTELY' | 'MONTHLY' | 'SECONDLY' | 'WEEKLY' | 'YEARLY';

/** Направление сортировки */
export type SortDirection = 'ASC' | 'DESC';

export type TaskAssignInput = {
  groupId: number;
  taskId: string;
};

export type TaskCloneInput = {
  id: string;
};

export type TaskCompleteDeleteInput = {
  id: string;
};

export type TaskCreateInput = {
  deadline?: string | null | undefined;
  description?: string | null | undefined;
  groupId?: number | null | undefined;
  name: string;
  priority: TaskPriority;
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

/** Приоритеты дела */
type TaskPriority = 'Delegate' | 'Delete' | 'Do' | 'Plan';

export type TaskRecoveryInput = {
  groupId: number;
  id: string;
};

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
type TaskStatus = 'ARCHIVED' | 'CANCELED' | 'COMPLETED' | 'DELETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'OVERDUE';

export type TaskUnassignInput = {
  groupId: number;
  taskId: string;
};

export type TaskUpdateInput = {
  deadline?: string | null | undefined;
  description?: string | null | undefined;
  id: string;
  name: string;
  priority: TaskPriority;
  recurrence?: TaskRecurrencyInput | null | undefined;
  startDate?: string | null | undefined;
};

export type GetAssignableTasksQueryVariables = Exact<{
  input: Types.GetAssignableTasksInput;
}>;

export type GetAssignableTasksQuery = {
  getAssignableTasks: Array<{ id: string; name: string; groupId: number | null; priority: Types.TaskPriority }>;
};

export type GetDiaryTasksQueryVariables = Exact<{
  input: Types.GetDiaryTasksInput;
}>;

export type GetDiaryTasksQuery = {
  getDiaryTasks: Array<{
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
  }>;
};

export type GetTasksCursorQueryVariables = Exact<{
  input: Types.GetTasksCursorInput;
}>;

export type GetTasksCursorQuery = {
  getTasksCursor: {
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
    }>;
    meta: { endCursor: string | null; hasNextPage: boolean };
  };
};

export type GetTasksPerPageQueryVariables = Exact<{
  input: Types.GetTasksPerPageInput;
}>;

export type GetTasksPerPageQuery = {
  getTasksPerPage: {
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
    }>;
    meta: { nextPage: boolean };
  };
};

export type CreateTaskMutationVariables = Exact<{
  input: Types.TaskCreateInput;
}>;

export type CreateTaskMutation = {
  createTask: {
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
  };
};

export type CloneTaskMutationVariables = Exact<{
  input: Types.TaskCloneInput;
}>;

export type CloneTaskMutation = {
  cloneTask: {
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
  };
};

export type UpdateTaskMutationVariables = Exact<{
  input: Types.TaskUpdateInput;
}>;

export type UpdateTaskMutation = {
  updateTask: {
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
  };
};

export type DeleteTaskMutationVariables = Exact<{
  input: Types.TaskDeleteInput;
}>;

export type DeleteTaskMutation = { deleteTask: { id: string } };

export type CompleteDeleteTaskMutationVariables = Exact<{
  input: Types.TaskCompleteDeleteInput;
}>;

export type CompleteDeleteTaskMutation = { completeDeleteTask: number };

export type TaskAssignMutationVariables = Exact<{
  input: Types.TaskAssignInput;
}>;

export type TaskAssignMutation = { assignTaskToGroup: { id: string; groupId: number | null } };

export type TaskUnassignMutationVariables = Exact<{
  input: Types.TaskUnassignInput;
}>;

export type TaskUnassignMutation = { unassignTaskToGroup: { id: string; groupId: number | null } };

export type TaskFinishMutationVariables = Exact<{
  input: Types.TaskFinishInput;
}>;

export type TaskFinishMutation = { finishTask: { id: string; status: Types.TaskStatus; cancelReason: string | null } };

export type TaskRecoveryMutationVariables = Exact<{
  input: Types.TaskRecoveryInput;
}>;

export type TaskRecoveryMutation = {
  taskRecovery: {
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
  };
};

export type TaskByIdQueryVariables = Exact<{
  input: Types.GetTaskByIdInput;
}>;

export type TaskByIdQuery = {
  getTaskById: {
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
  };
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
export const GetDiaryTasksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetDiaryTasks' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'GetDiaryTasksInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getDiaryTasks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TaskFragment' } }],
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetDiaryTasksQuery, GetDiaryTasksQueryVariables>;
export const GetTasksCursorDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTasksCursor' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'GetTasksCursorInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getTasksCursor' },
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
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TaskFragment' } }],
                  },
                },
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetTasksCursorQuery, GetTasksCursorQueryVariables>;
export const GetTasksPerPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTasksPerPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'GetTasksPerPageInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getTasksPerPage' },
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
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TaskFragment' } }],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'meta' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'nextPage' } }],
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetTasksPerPageQuery, GetTasksPerPageQueryVariables>;
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
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TaskFragment' } }],
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateTaskMutation, CreateTaskMutationVariables>;
export const CloneTaskDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CloneTask' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'TaskCloneInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'cloneTask' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TaskFragment' } }],
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<CloneTaskMutation, CloneTaskMutationVariables>;
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
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TaskFragment' } }],
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
export const CompleteDeleteTaskDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CompleteDeleteTask' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'TaskCompleteDeleteInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'completeDeleteTask' },
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
} as unknown as DocumentNode<CompleteDeleteTaskMutation, CompleteDeleteTaskMutationVariables>;
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
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'groupId' } },
              ],
            },
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
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'groupId' } },
              ],
            },
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
export const TaskRecoveryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'TaskRecovery' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'TaskRecoveryInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'taskRecovery' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TaskFragment' } }],
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<TaskRecoveryMutation, TaskRecoveryMutationVariables>;
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
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'TaskFragment' } }],
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<TaskByIdQuery, TaskByIdQueryVariables>;
