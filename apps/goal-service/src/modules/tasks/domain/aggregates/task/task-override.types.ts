import { TaskOverrideType, TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { Task } from './tasks.aggregate';

interface TaskOverrodeState {
  readonly id: number;
  readonly userId: number;
  readonly groupId?: number;
  readonly name: string;
  readonly description?: string;
  readonly priority: number;
  readonly weight: number;
  readonly cancelReason?: string;
  readonly startDate: string;
  readonly occurrenceStart: string;
  readonly deadline?: string;
  readonly endDate?: string;
  readonly status: TaskStatus;

  readonly masterTaskId: number;
  readonly type: TaskOverrideType;
}

interface TaskOverrideCreateInput {
  readonly task: Task;
  readonly occurrenceStart: DateVo;
  readonly type: TaskOverrideType;
}

interface TaskOverrideRestoreInput {
  readonly task: Task;
  readonly masterTaskId: number;
  readonly occurrenceStart: string;
  readonly type: TaskOverrideType;
}

export { TaskOverrideRestoreInput, TaskOverrideCreateInput, TaskOverrodeState };
