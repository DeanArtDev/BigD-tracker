import type { ApiDto } from '@/shared/api/types';

type TaskEntity = Omit<ApiDto['TaskDto'], 'userId'>;

enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export { type TaskEntity, TaskStatus };
