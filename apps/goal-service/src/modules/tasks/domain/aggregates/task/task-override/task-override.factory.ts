import { TaskOverrideType } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';
import { Task } from '../tasks.aggregate';
import { TaskOverride } from './task-override.aggregate';

class TaskOverrideFactory {
  static create(input: {
    task: Task;
    type: TaskOverrideType;
    recurrenceId: number;
    recurrenceStart: string;
  }): TaskOverride {
    const { task, type, recurrenceId } = input;
    return TaskOverride.create({ task, type, recurrenceId, recurrenceStart: DateVo.create(input.recurrenceStart) });
  }

  static replace(override: TaskOverride, patch: { task: Task; type: TaskOverrideType }): TaskOverride {
    const { task, type } = patch;
    return override.replace({ task, type });
  }

  static delete(override: TaskOverride): TaskOverride {
    return override.delete();
  }
}

export { TaskOverrideFactory };
