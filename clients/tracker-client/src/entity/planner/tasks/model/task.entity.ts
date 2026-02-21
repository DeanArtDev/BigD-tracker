import type { ApiSchemas } from '@/shared/api/types';
import type { Override } from '@/shared/lib/type-helpers';

enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

enum TasksQueryStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

type TaskEntity = Override<Omit<ApiSchemas['TaskDto'], 'userId'>, 'status', TaskStatus>;

export { type TaskEntity, TaskStatus, TasksQueryStatus };
