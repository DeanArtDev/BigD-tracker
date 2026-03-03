import { TaskOverrideType } from '@big-d/api-contracts';
import { Task } from './tasks.aggregate';

interface TaskOverrodeState {
  task: Task;
  masterTaskId: number;
  type: TaskOverrideType;
}

interface TaskOverrideRestoreInput {
  readonly task: Task;
  readonly masterTaskId: number;
  readonly type: TaskOverrideType;
}

export { TaskOverrideRestoreInput, TaskOverrodeState };
