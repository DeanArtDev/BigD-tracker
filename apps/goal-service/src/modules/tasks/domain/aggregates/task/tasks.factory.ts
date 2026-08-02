import { TaskFinishStatus } from '@big-d/api-contracts';
import { DateVo, Name, TimezoneVo } from '@big-d/api-utils';
import { Task } from './tasks.aggregate';
import { TaskCreateInput, TaskReplaceInput } from './tasks.types';
import { Priority } from './value-objects';

interface TaskFactoryCreateInput {
  readonly userId: number;
  readonly groupId?: number;
  readonly name: string;
  readonly description?: string;
  readonly priority?: number;
  readonly startDate?: string;
  readonly deadline?: string;
  readonly recurrenceId?: number;
}

interface TaskFactoryReplaceInput {
  readonly name: string;
  readonly description?: string;
  readonly priority: number;
  readonly startDate?: string;
  readonly deadline?: string;
  readonly recurrenceId?: number;
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
      groupId: input.groupId,
      name: Name.create(input.name),
      description: input.description,
      priority: input.priority != null ? Priority.create(input.priority) : Priority.defaultValue(),
      startDate: input.startDate != null ? DateVo.create(input.startDate) : undefined,
      deadline: input.deadline != null ? DateVo.create(input.deadline) : undefined,
      recurrenceId: input.recurrenceId,
    };

    return Task.create(state);
  }

  static clone(task: Task): Task {
    return task.clone();
  }

  static replace(task: Task, input: TaskFactoryReplaceInput): Task {
    const state: TaskReplaceInput = {
      groupId: task.groupId,
      name: Name.create(input.name),
      description: input.description,
      priority: Priority.create(input.priority),
      startDate: input.startDate != null ? DateVo.create(input.startDate) : undefined,
      deadline: input.deadline != null ? DateVo.create(input.deadline) : undefined,
      recurrenceId: input.recurrenceId,
    };

    return task.replace(state);
  }

  static finish(task: Task, input: { timezone: string; type: TaskFinishStatus; reason?: string }): Task {
    const { reason, timezone, type } = input;
    return task.finish({ now: DateVo.nowByTZ(TimezoneVo.create(timezone).value), reason, type });
  }

  static updateInbox(task: Task, input: TaskFactoryUpdateInboxInput): Task {
    const state: TaskReplaceInput = {
      name: Name.create(input.name),
      description: input.description,
      priority: Priority.create(input.priority),
      groupId: task.groupId,
      startDate: input.startDate != null ? DateVo.create(input.startDate) : undefined,
      deadline: input.deadline != null ? DateVo.create(input.deadline) : undefined,
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

  static assignToGroup(task: Task, groupId: number): Task {
    return task.assignToGroup({ groupId });
  }

  static unassignFromGroup(task: Task): Task {
    return task.unassignFromGroup();
  }
}

export { TaskFactory, TaskFactoryReplaceInput };
