import type { ApiSchemas } from '@/shared/api/types';

type TaskDto = ApiSchemas['TaskDto'];

interface TaskInboxEntity {
  readonly id: TaskDto['id'];
  readonly name: TaskDto['name'];
  readonly groupId: TaskDto['groupId'];
  readonly description: TaskDto['description'];
  readonly priority: TaskDto['priority'];
  readonly deadline: TaskDto['deadline'];
}

export type { TaskInboxEntity };
