/** Internal type. DO NOT USE DIRECTLY. */
type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import * as Types from '@/shared/transport/graphql/schema-types';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** Приоритеты дела */
type TaskPriority = 'Delegate' | 'Delete' | 'Do' | 'Plan';

/** Статусы дела */
type TaskStatus = 'ARCHIVED' | 'CANCELED' | 'COMPLETED' | 'DELETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'OVERDUE';

export type TaskFragmentFragment = {
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

export const TaskFragmentFragmentDoc = {
  kind: 'Document',
  definitions: [
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
} as unknown as DocumentNode<TaskFragmentFragment, unknown>;
