import { TaskStatus } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';
import { Priority } from './value-objects';

interface TaskState {
  readonly id: number;
  readonly userId: number;
  groupId?: number;
  name: Name;
  description?: string;
  priority: Priority;
  cancelReason?: string;
  startDate?: DateVo;
  deadline?: DateVo;
  endDate?: DateVo;
  status: TaskStatus;
  readonly recurrenceId?: number;
}

interface TaskCreateInput {
  readonly userId: number;
  readonly groupId?: number;
  readonly name: Name;
  readonly description?: string;
  readonly priority: Priority;
  readonly startDate?: DateVo;
  readonly deadline?: DateVo;
  readonly recurrenceId?: number;
}

interface TaskRestoreInput {
  readonly id: number;
  readonly userId: number;
  readonly groupId?: number;
  readonly name: Name;
  readonly description?: string;
  readonly priority: Priority;
  readonly cancelReason?: string;
  readonly startDate?: DateVo;
  readonly deadline?: DateVo;
  readonly endDate?: DateVo;
  readonly status: TaskStatus;
  readonly recurrenceId?: number;
}

interface TaskReplaceInput {
  readonly groupId?: number;
  readonly name: Name;
  readonly description?: string;
  readonly priority: Priority;
  readonly startDate?: DateVo;
  readonly deadline?: DateVo;
  readonly recurrenceId?: number;
}

export { TaskCreateInput, TaskRestoreInput, TaskState, TaskReplaceInput };
