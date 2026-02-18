import { TaskStatus } from '@big-d/api-contracts';
import { Priority, Weight } from '../../value-objects';
import { DateVo, Name } from '@big-d/api-utils';

interface TaskState {
  readonly id: number;
  readonly userId: number;
  readonly groupId?: number;
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
  readonly groupId?: number;
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
  readonly groupId?: number;
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

interface TaskReplaceInput {
  readonly name: Name;
  readonly description?: string;
  readonly priority: Priority;
  readonly weight: Weight;
  readonly startDate?: DateVo;
  readonly deadline?: DateVo;
  readonly recurrence?: string;
}

export { TaskCreateInput, TaskRestoreInput, TaskState, TaskReplaceInput };
