/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@/shared/transport/graphql/schema-types';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetGroupInput = {
  groupId: number;
};

export type GetGroupListInput = {
  cursor?: string | null | undefined;
  ids?: Array<number> | null | undefined;
  limit: number;
  search?: string | null | undefined;
};

export type GetGroupTasksInput = {
  order?: GroupTaskOrder | null | undefined;
};

export type GroupCreateInput = {
  description?: string | null | undefined;
  name: string;
};

export type GroupDeleteInput = {
  groupId: number;
};

export type GroupSettingsUpdateInput = {
  eventColor?: string | null | undefined;
  eventColorDark?: string | null | undefined;
  eventSelectedColor?: string | null | undefined;
  eventSelectedColorDark?: string | null | undefined;
  groupId: number;
  isDefault?: boolean | null | undefined;
  isReadonly?: boolean | null | undefined;
  isVisible?: boolean | null | undefined;
  lineColor?: string | null | undefined;
  lineColorDark?: string | null | undefined;
  textColor?: string | null | undefined;
  textColorDark?: string | null | undefined;
};

/** Статусы группы */
type GroupStatus = 'DONE' | 'IN_PROGRESS' | 'NOT_STARTED';

/** Порядок дел внутри группы */
type GroupTaskOrder = 'Group';

export type GroupUpdateInput = {
  description?: string | null | undefined;
  id: number;
  name: string;
  tasks?: Array<GroupUpdateTaskInput> | null | undefined;
};

export type GroupUpdateTaskInput = {
  id: string;
};

/** Частота повторения дела */
export type RecurrenceFrequency = 'DAILY' | 'HOURLY' | 'MINUTELY' | 'MONTHLY' | 'SECONDLY' | 'WEEKLY' | 'YEARLY';

/** Приоритеты дела */
type TaskPriority = 'Delegate' | 'Delete' | 'Do' | 'Plan';

/** День недели повторения дела */
export type TaskRecurrenceWeekday = 'FR' | 'MO' | 'SA' | 'SU' | 'TH' | 'TU' | 'WE';

/** Статусы дела */
type TaskStatus = 'ARCHIVED' | 'CANCELED' | 'COMPLETED' | 'DELETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'OVERDUE';

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

export type UpdateGroupMutationVariables = Exact<{
  input: Types.GroupUpdateInput;
}>;

export type UpdateGroupMutation = {
  updateGroup: { id: number; name: string; description: string | null; progress: number; status: Types.GroupStatus };
};

export type UpdateGroupSettingsMutationVariables = Exact<{
  input: Types.GroupSettingsUpdateInput;
}>;

export type UpdateGroupSettingsMutation = {
  updateGroupSettings: {
    eventColor: string;
    eventSelectedColor: string;
    lineColor: string;
    textColor: string;
    eventColorDark: string;
    eventSelectedColorDark: string;
    lineColorDark: string;
    textColorDark: string;
    isDefault: boolean;
    isVisible: boolean;
    isReadonly: boolean;
  };
};

export type DeleteGroupMutationVariables = Exact<{
  input: Types.GroupDeleteInput;
}>;

export type DeleteGroupMutation = { groupDelete: boolean };

export type CreateGroupMutationVariables = Exact<{
  input: Types.GroupCreateInput;
}>;

export type CreateGroupMutation = {
  createGroup: { id: number; name: string; description: string | null; status: Types.GroupStatus; progress: number };
};

export type GetAssignableGroupsQueryVariables = Exact<{ [key: string]: never }>;

export type GetAssignableGroupsQuery = { getAssignableGroups: Array<{ id: number; name: string }> };

export type GetGroupByIdQueryVariables = Exact<{
  input: Types.GetGroupInput;
}>;

export type GetGroupByIdQuery = {
  getGroup: {
    id: number;
    name: string;
    description: string | null;
    status: Types.GroupStatus;
    progress: number;
    taskCount: number | null;
  };
};

export type GetGroupListQueryVariables = Exact<{
  input: Types.GetGroupListInput;
}>;

export type GetGroupListQuery = {
  getGroupList: {
    items: Array<{ id: number; name: string; status: Types.GroupStatus; description: string | null }>;
    meta: { endCursor: string | null; hasNextPage: boolean };
  };
};

export type GetDiaryGroupListQueryVariables = Exact<{ [key: string]: never }>;

export type GetDiaryGroupListQuery = {
  getDiaryGroupList: Array<{
    id: number;
    name: string;
    settings: {
      eventColor: string;
      eventSelectedColor: string;
      lineColor: string;
      textColor: string;
      eventColorDark: string;
      eventSelectedColorDark: string;
      lineColorDark: string;
      textColorDark: string;
      isDefault: boolean;
      isVisible: boolean;
      isReadonly: boolean;
    } | null;
  }>;
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
} as unknown as DocumentNode<GetDetailedGroupByIdQuery, GetDetailedGroupByIdQueryVariables>;
export const UpdateGroupDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateGroup' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'GroupUpdateInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateGroup' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'progress' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateGroupMutation, UpdateGroupMutationVariables>;
export const UpdateGroupSettingsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateGroupSettings' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'GroupSettingsUpdateInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateGroupSettings' },
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
                { kind: 'Field', name: { kind: 'Name', value: 'eventColor' } },
                { kind: 'Field', name: { kind: 'Name', value: 'eventSelectedColor' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lineColor' } },
                { kind: 'Field', name: { kind: 'Name', value: 'textColor' } },
                { kind: 'Field', name: { kind: 'Name', value: 'eventColorDark' } },
                { kind: 'Field', name: { kind: 'Name', value: 'eventSelectedColorDark' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lineColorDark' } },
                { kind: 'Field', name: { kind: 'Name', value: 'textColorDark' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isDefault' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isVisible' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isReadonly' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateGroupSettingsMutation, UpdateGroupSettingsMutationVariables>;
export const DeleteGroupDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteGroup' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'GroupDeleteInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'groupDelete' },
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
} as unknown as DocumentNode<DeleteGroupMutation, DeleteGroupMutationVariables>;
export const CreateGroupDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateGroup' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'GroupCreateInput' } } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createGroup' },
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
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateGroupMutation, CreateGroupMutationVariables>;
export const GetAssignableGroupsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAssignableGroups' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getAssignableGroups' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAssignableGroupsQuery, GetAssignableGroupsQueryVariables>;
export const GetGroupByIdDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetGroupById' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: { kind: 'NonNullType', type: { kind: 'NamedType', name: { kind: 'Name', value: 'GetGroupInput' } } },
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
                { kind: 'Field', name: { kind: 'Name', value: 'taskCount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetGroupByIdQuery, GetGroupByIdQueryVariables>;
export const GetGroupListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetGroupList' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'GetGroupListInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getGroupList' },
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
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                    ],
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
  ],
} as unknown as DocumentNode<GetGroupListQuery, GetGroupListQueryVariables>;
export const GetDiaryGroupListDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetDiaryGroupList' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getDiaryGroupList' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'settings' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'eventColor' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'eventSelectedColor' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'lineColor' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'textColor' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'eventColorDark' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'eventSelectedColorDark' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'lineColorDark' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'textColorDark' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'isDefault' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'isVisible' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'isReadonly' } },
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
} as unknown as DocumentNode<GetDiaryGroupListQuery, GetDiaryGroupListQueryVariables>;
