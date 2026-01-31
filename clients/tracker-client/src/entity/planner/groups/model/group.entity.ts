import type { TaskEntity } from '@/entity/planner/tasks';
import type { ApiDto } from '@/shared/api/types';

type GroupDto = ApiDto['GroupDto'];
type GroupStatus = GroupDto['status'];

interface GroupEntity {
  readonly id: GroupDto['id'];
  readonly description: GroupDto['description'];
  readonly status: GroupStatus;
  readonly progress: GroupDto['progress'];
  readonly name: GroupDto['name'];
  readonly tasks: TaskEntity[];
}

export type { GroupEntity, GroupStatus };
