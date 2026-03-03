import { Task } from '@/modules/tasks/domain';
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
    if (this.#state.tasks.length > 0) {
      throw new ExceptionTaskDomainInvalidInvariant({
        message: `Group can't be delete if has at least one task`,
        field: 'tasks',
      });
    }

    this.#state.group.delete();
    return this;
  }

  public replace(input: GroupWithTasksReplaceInput): this {
    this.#state.tasks = input.tasks;
    this.#state.group = isFunction(input.group) ? input.group(this.#state.group) : input.group;

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
