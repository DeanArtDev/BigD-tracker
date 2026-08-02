import { TaskOverrideType, TaskStatus } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { Task } from '../tasks.aggregate';

interface TaskOverrodeState {
  readonly id: number;
  readonly userId: number;
  readonly groupId?: number;
  readonly recurrenceId: number;
  readonly recurrenceStart: DateVo;

  name: string;
  description?: string;
  priority: number;
  cancelReason?: string;
  startDate: string;
  deadline: string;
  endDate?: string;
  status: TaskStatus;
  type: TaskOverrideType;
}

interface TaskOverrideCreateInput {
  readonly task: Task;
  readonly type: TaskOverrideType;
  readonly recurrenceId: number;
  readonly recurrenceStart: DateVo;
}

interface TaskOverrideReplaceInput {
  readonly task: Task;
  readonly type: TaskOverrideType;
}

interface TaskOverrideRestoreInput {
  readonly task: Task;
  readonly recurrenceId: number;
  readonly type: TaskOverrideType;
  readonly recurrenceStart: DateVo;
}

export { TaskOverrideRestoreInput, TaskOverrideCreateInput, TaskOverrodeState, TaskOverrideReplaceInput };
