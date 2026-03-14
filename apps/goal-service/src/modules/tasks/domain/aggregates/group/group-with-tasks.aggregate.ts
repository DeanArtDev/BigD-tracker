import { Task, tasksQuerySpec } from '@/modules/tasks/domain';
import { ExceptionTaskDomainInvalidInvariant } from '@/modules/tasks/domain/exceptions';
import { GroupStatus } from '@big-d/api-contracts';
import { isFunction } from 'lodash';
import { Group } from './group.aggregate';

interface GroupWithTasksState {
  group: Group;
  tasks: Task[];
}

interface GroupWithTasksRestoreInput {
  readonly group: Group;
  readonly tasks: Task[];
}

interface GroupWithTasksReplaceInput {
  readonly group: Group | ((group: Group) => Group);
  readonly tasks: Task[];
}

interface GroupWithTasksCreateInput {
  readonly group: Group;
  readonly tasks: Task[];
}

class GroupWithTasks {
  #state: GroupWithTasksState;

  private constructor(input: Readonly<{ group: Group; tasks: Task[] }>) {
    this.#state = {
      group: input.group,
      tasks: input.tasks,
    };
  }

  static create(input: GroupWithTasksCreateInput): GroupWithTasks {
    return new GroupWithTasks({
      group: input.group,
      tasks: input.tasks,
    });
  }

  public delete(): this {
    const tasks = this.#state.tasks.filter((task: Task) => tasksQuerySpec.readableStatuses.includes(task.status));

    if (tasks.length > 0) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Group can't be delete if has at least one task`,
        field: 'tasks',
      });
    }

    this.#state.group.delete();
    return this;
  }

  public replace(input: GroupWithTasksReplaceInput): this {
    this.#state.group = isFunction(input.group) ? input.group(this.#state.group) : input.group;
    if (input.tasks.some((t) => t.groupId !== this.#state.group.id)) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: 'Дело не принадлежит этой группе',
        field: 'tasks',
      });
    }

    this.#state.tasks = input.tasks;

    return this;
  }

  static restore(input: GroupWithTasksRestoreInput): GroupWithTasks {
    return new GroupWithTasks({
      group: input.group,
      tasks: input.tasks,
    });
  }

  get id(): number {
    return this.#state.group.id;
  }

  get userId(): number {
    return this.#state.group.userId;
  }

  get name(): string {
    return this.#state.group.name;
  }

  get description(): string | undefined {
    return this.#state.group.description;
  }

  get progress(): number {
    return this.#state.group.progress;
  }

  get status(): GroupStatus {
    return this.#state.group.status;
  }

  get tasks(): Task[] {
    return this.#state.tasks;
  }
}

export { GroupWithTasks };
