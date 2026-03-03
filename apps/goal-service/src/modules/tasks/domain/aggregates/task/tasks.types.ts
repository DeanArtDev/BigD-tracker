import { RecurrenceFrequency, TaskRecurrenceWeekday, TaskStatus } from '@big-d/api-contracts';
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
  startDate?: DateVo;
  deadline?: DateVo;
  endDate?: DateVo;
  status: TaskStatus;
  recurrence?: RecurrenceVo;
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
  readonly recurrence?: RecurrenceVo;
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
  readonly deadline?: DateVo;
  readonly endDate?: DateVo;
  readonly status: TaskStatus;
  readonly recurrence?: RecurrenceVo;
}

interface TaskReplaceInput {
  readonly name: Name;
  readonly description?: string;
  readonly priority: Priority;
  readonly weight: Weight;
  readonly startDate?: DateVo;
  readonly deadline?: DateVo;
  readonly recurrence?: RecurrenceVo;
}

interface TaskRecurrence {
  readonly start: string;
  readonly frequency?: RecurrenceFrequency;
  readonly weekdays?: TaskRecurrenceWeekday[];
  readonly end?: string;
}

export { TaskCreateInput, TaskRestoreInput, TaskState, TaskReplaceInput, TaskRecurrence };
