import type { ApiDto } from '@/shared/api/types';

type TaskDto = ApiDto['TaskDto'];

interface TaskInfoEntity {
  readonly id: TaskDto['id'];
  readonly priority: TaskDto['priority'];
  readonly status: TaskDto['status'];
  readonly deadline: TaskDto['deadline'];
}

export type { TaskInfoEntity };
