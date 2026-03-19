import { TaskStatus, TaskType } from '@/entity/planner/tasks';
import type { ApiSchemas } from '@/shared/api/types';

type TaskDto = ApiSchemas['TaskDto'];

interface TaskInboxEntity {
  readonly id: TaskDto['id'];
  readonly name: TaskDto['name'];
  readonly groupId: TaskDto['groupId'];
  readonly startDate: TaskDto['startDate'];
  readonly deadline: TaskDto['deadline'];
  readonly description: TaskDto['description'];
  readonly priority: TaskDto['priority'];
  readonly weight: TaskDto['weight'];
  readonly recurrence: TaskDto['recurrence'];
  readonly status: TaskStatus;
  readonly type: TaskType;
}

export type { TaskInboxEntity };
