import { Task, TaskOverride } from '@/modules/tasks/domain';
import { TaskOverrideType } from '@big-d/api-contracts';
import { DateVo } from '@big-d/api-utils';

class TaskOverrideFactory {
  static create(input: { task: Task; type: TaskOverrideType; occurrenceStart: string }): TaskOverride {
    const { task, type, occurrenceStart } = input;
    return TaskOverride.create({ task, type, occurrenceStart: DateVo.create(occurrenceStart) });
  }
}

export { TaskOverrideFactory };
