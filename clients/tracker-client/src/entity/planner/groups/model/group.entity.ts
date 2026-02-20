import type { TaskEntity } from '@/entity/planner/tasks';
import type { ApiSchemas } from '@/shared/api/types';

type GroupDto = ApiSchemas['GroupDto'];

enum GroupStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

interface GroupEntity {
  readonly id: GroupDto['id'];
  readonly description: GroupDto['description'];
  readonly status: GroupStatus;
  readonly progress: GroupDto['progress'];
  readonly name: GroupDto['name'];
  readonly tasks: TaskEntity[];
}

export type { GroupEntity };
export { GroupStatus };
