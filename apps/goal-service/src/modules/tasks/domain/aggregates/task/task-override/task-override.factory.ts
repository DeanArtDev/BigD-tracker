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

  static update(
    override: TaskOverride,
    patch: { task: Task; type: TaskOverrideType; occurrenceStart: string },
  ): TaskOverride {
    const { task, type } = patch;
    return override.replace({ task, type });
  }
}

export { TaskOverrideFactory };
