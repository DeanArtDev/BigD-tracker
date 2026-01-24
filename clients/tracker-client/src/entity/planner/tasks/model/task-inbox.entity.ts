import type { ApiDto } from '@/shared/api/types';

type TaskDto = ApiDto['TaskDto'];

interface TaskInboxEntity {
  readonly id: TaskDto['id'];
  readonly name: TaskDto['name'];
  readonly description: TaskDto['description'];
  readonly priority: TaskDto['priority'];
  readonly deadline: TaskDto['deadline'];
}

export type { TaskInboxEntity };
