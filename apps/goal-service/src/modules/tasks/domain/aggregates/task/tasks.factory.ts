import { Priority, TaskUpdateInput, Weight } from '@/modules/tasks/domain';
import { ExceptionDomainInvalidInvariant } from '@/modules/tasks/domain/errors';
import { TaskStatus } from '@big-d/api-contracts';
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

interface TaskFactoryReplaceInput {
  readonly name: string;
  readonly description?: string;
  readonly priority: number;
  readonly weight: number;
  readonly startDate?: string;
  readonly deadline?: string;
  readonly recurrence?: string;
}

interface TaskFactoryUpdateInboxInput {
  readonly name: string;
  readonly description?: string;
  readonly priority: number;
  readonly startDate?: string;
  readonly deadline?: string;
}

class TaskFactory {
  static create(input: TaskFactoryCreateInput): Task {
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

  static clone(task: Task): Task {
    const clonedTask = task.clone();

    if (!clonedTask.isDraft) {
      throw new ExceptionDomainInvalidInvariant({
        message: `Cloned task from task:${task.id} must be a draft`,
        field: 'clone',
      });
    }

    return clonedTask;
  }

  static replace(task: Task, input: TaskFactoryReplaceInput): Task {
    const state: TaskUpdateInput = {
      name: Name.create(input.name),
      description: input.description,
      priority: Priority.create(input.priority),
      weight: Weight.create(input.weight),
      startDate: input.startDate != null ? DateVo.create(input.startDate) : undefined,
      deadline: input.deadline != null ? DateVo.create(input.deadline) : undefined,
      recurrence: input.recurrence,
    };

    return task.update(state);
  }

  static updateInbox(task: Task, input: TaskFactoryUpdateInboxInput): Task {
    const state: TaskUpdateInput = {
      name: Name.create(input.name),
      description: input.description,
      priority: Priority.create(input.priority),
      weight: Weight.create(task.weight),
      startDate: input.startDate != null ? DateVo.create(input.startDate) : undefined,
      deadline: input.deadline != null ? DateVo.create(input.deadline) : undefined,
      recurrence: task.recurrence,
    };

    return task.update(state);
  }

  static deleteSoft(task: Task): Task {
    return task.deleteSoft();
  }

  static assignToGroup(task: Task, type: 'COMMON' | 'IN_BOX' = 'COMMON'): Task {
    return task.assignToGroup(type === 'IN_BOX' ? TaskStatus.NOT_STARTED : undefined);
  }

  static unassignFromGroup(task: Task): Task {
    return task.unassignFromGroup();
  }
}

export { TaskFactory, TaskFactoryReplaceInput };
