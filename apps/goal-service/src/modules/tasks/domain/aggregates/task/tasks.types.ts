import { Priority, Weight } from '../../value-objects';
import { DateVo, Name } from '@big-d/api-utils';

const enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

interface TaskState {
  readonly id: number;
  readonly userId: number;
  name: Name;
  description?: string;
  priority: Priority;
  weight: Weight;
  cancelReason?: string;
  startDate?: DateVo;
  endDate?: DateVo;
  deadline?: DateVo;
  status: TaskStatus;
  recurrence?: string;
}

interface TaskCreateInput {
  readonly userId: number;
  readonly name: Name;
  readonly description?: string;
  readonly priority: Priority;
  readonly weight: Weight;
  readonly startDate?: DateVo;
  readonly deadline?: DateVo;
  readonly recurrence?: string;
}

interface TaskRestoreInput {
  readonly id: number;
  readonly userId: number;
  readonly name: Name;
  readonly description?: string;
  readonly priority: Priority;
  readonly weight: Weight;
  readonly cancelReason?: string;
  readonly startDate?: DateVo;
  readonly endDate?: DateVo;
  readonly deadline?: DateVo;
  readonly status: TaskStatus;
  readonly recurrence?: string;
}

export { TaskStatus, TaskCreateInput, TaskRestoreInput, TaskState };
