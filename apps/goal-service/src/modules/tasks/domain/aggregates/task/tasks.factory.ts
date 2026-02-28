import {
  Priority,
  RecurrenceVo,
  TaskRecurrence,
  TaskReplaceInput,
  Weight,
} from '@/modules/tasks/domain';
import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { DateVo, Name } from '@big-d/api-utils';
import { Task } from './tasks.aggregate';
import { TaskCreateInput } from './tasks.types';

interface TaskFactoryCreateInput {
  readonly userId: number;
  readonly groupId?: number;
  readonly name: string;
  readonly description?: string;
  readonly priority?: number;
  readonly weight?: number;
  readonly recurrence?: TaskRecurrence;
}

interface TaskFactoryReplaceInput {
  readonly name: string;
  readonly description?: string;
  readonly priority: number;
  readonly weight: number;
  readonly recurrence?: TaskRecurrence;
}

interface TaskFactoryUpdateInboxInput {
  readonly name: string;
  readonly description?: string;
  readonly priority: number;
  readonly recurrence?: TaskRecurrence;
}

class TaskFactory {
  static create(input: TaskFactoryCreateInput): Task {
    const { startDate, deadline, frequency } = input.recurrence ?? {};

    const state: TaskCreateInput = {
      userId: input.userId,
      groupId: input.groupId,
      name: Name.create(input.name),
      description: input.description,
      priority: input.priority != null ? Priority.create(input.priority) : Priority.defaultValue(),
      weight: input.weight != null ? Weight.create(input.weight) : Weight.defaultValue(),
      recurrence: RecurrenceVo.create({
        frequency,
        startDate: startDate != null ? DateVo.create(startDate) : undefined,
        deadline: deadline != null ? DateVo.create(deadline) : undefined,
      }),
    };

    return Task.create(state);
  }

  static clone(task: Task): Task {
    const clonedTask = task.clone();

    if (!clonedTask.isDraft) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Cloned task aggregate from task:${task.id} must be a draft`,
        field: 'clone',
      });
    }

    return clonedTask;
  }

  static replace(task: Task, input: TaskFactoryReplaceInput): Task {
    const { startDate, deadline, frequency } = input.recurrence ?? {};

    const state: TaskReplaceInput = {
      name: Name.create(input.name),
      description: input.description,
      priority: Priority.create(input.priority),
      weight: Weight.create(input.weight),
      recurrence: RecurrenceVo.create({
        frequency,
        startDate: startDate != null ? DateVo.create(startDate) : undefined,
        deadline: deadline != null ? DateVo.create(deadline) : undefined,
      }),
    };

    return task.replace(state);
  }

  static finish(task: Task): Task {
    return task.finish();
  }

  static updateInbox(task: Task, input: TaskFactoryUpdateInboxInput): Task {
    const { deadline } = input.recurrence ?? {};

    const state: TaskReplaceInput = {
      name: Name.create(input.name),
      description: input.description,
      priority: Priority.create(input.priority),
      weight: Weight.create(task.weight),
      recurrence: RecurrenceVo.create({
        deadline: deadline != null ? DateVo.create(deadline) : undefined,
      }),
    };

    return task.replace(state);
  }

  static deleteSoft(task: Task): Task {
    return task.deleteSoft();
  }

  static deleteComplete(task: Task): Task {
    return task.deleteComplete();
  }

  static recovery(task: Task): Task {
    return task.recovery();
  }

  static assignToGroup(task: Task, type: 'COMMON' | 'IN_BOX' = 'COMMON'): Task {
    return task.assignToGroup({ reset: type === 'IN_BOX' });
  }

  static unassignFromGroup(task: Task): Task {
    return task.unassignFromGroup();
  }
}

export { TaskFactory, TaskFactoryReplaceInput };
