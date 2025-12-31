import { Priority, Weight } from '@/modules/tasks/domain';
import { DateVo, Name } from '@big-d/api-utils';
import { Task } from './tasks.aggregate';
import { TaskCreateInput } from './tasks.types';

interface TaskFactoryCreateInput {
  readonly userId: number;
  readonly name: string;
  readonly description?: string;
  readonly priority?: number;
  readonly weight?: number;
  readonly startDate?: string;
  readonly deadline?: string;
  readonly recurrence?: string;
}

export class TaskFactory {
  constructor() {}

  create(input: TaskFactoryCreateInput): Task {
    const state: TaskCreateInput = {
      userId: input.userId,
      name: Name.create(input.name),
      description: input.description,
      priority: input.priority != null ? Priority.create(input.priority) : Priority.defaultValue(),
      weight: input.weight != null ? Weight.create(input.weight) : Weight.defaultValue(),
      startDate: input.startDate != null ? DateVo.create(input.startDate) : undefined,
      deadline: input.deadline != null ? DateVo.create(input.deadline) : undefined,
      recurrence: input.recurrence,
    };

    return Task.create(state);
  }
}
