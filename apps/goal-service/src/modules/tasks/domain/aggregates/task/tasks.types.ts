import { RecurrenceFrequency, TaskStatus } from '@big-d/api-contracts';
import { DateVo, Name } from '@big-d/api-utils';
import { Priority, RecurrenceVo, Weight } from './value-objects';

interface TaskState {
  readonly id: number;
  readonly userId: number;
  readonly groupId?: number;
  name: Name;
  description?: string;
  priority: Priority;
  weight: Weight;
  cancelReason?: string;
  endDate?: DateVo;
  status: TaskStatus;
  recurrence: RecurrenceVo;
}

interface TaskCreateInput {
  readonly userId: number;
  readonly groupId?: number;
  readonly name: Name;
  readonly description?: string;
  readonly priority: Priority;
  readonly weight: Weight;
  readonly recurrence: RecurrenceVo;
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
  readonly endDate?: DateVo;
  readonly status: TaskStatus;
  readonly recurrence: RecurrenceVo;
}

interface TaskReplaceInput {
  readonly name: Name;
  readonly description?: string;
  readonly priority: Priority;
  readonly weight: Weight;
  readonly recurrence: RecurrenceVo;
}

interface TaskRecurrence {
  readonly frequency?: RecurrenceFrequency;
  readonly startDate?: string;
  readonly deadline?: string;
}

export { TaskCreateInput, TaskRestoreInput, TaskState, TaskReplaceInput, TaskRecurrence };
