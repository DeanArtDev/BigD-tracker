import { TaskView } from '@/modules/tasks/application/dto';
import { GroupStatus } from '@big-d/api-contracts';
import { Group } from './group.aggregate';

interface GroupWithTasksState {
  readonly tasks: TaskView[];
}

interface GroupWithTasksRestoreInput {
  readonly group: Group;
  readonly tasks: TaskView[];
}

interface GroupWithTasksReplaceInput {
  readonly group: Group;
  readonly tasks: TaskView[];
}

interface GroupWithTasksCreateInput {
  readonly group: Group;
  readonly tasks: TaskView[];
}

class GroupWithTasks {
  readonly id: number;
  readonly userId: number;
  readonly name: string;
  readonly description?: string;
  readonly status: GroupStatus;
  readonly progress: number;
  #state: GroupWithTasksState;

  private constructor(input: Readonly<{ group: Group; tasks: TaskView[] }>) {
    this.#state = {
      tasks: input.tasks,
    };

    this.id = input.group.id;
    this.name = input.group.name;
    this.description = input.group.description;
    this.userId = input.group.userId;
    this.status = input.group.status;
    this.progress = input.group.progress;
  }

  static create(input: GroupWithTasksCreateInput): GroupWithTasks {
    return new GroupWithTasks({
      group: input.group,
      tasks: input.tasks,
    });
  }

  static replace(input: GroupWithTasksReplaceInput): GroupWithTasks {
    return new GroupWithTasks({
      group: input.group,
      tasks: input.tasks,
    });
  }

  static restore(input: GroupWithTasksRestoreInput): GroupWithTasks {
    return new GroupWithTasks({
      group: input.group,
      tasks: input.tasks,
    });
  }

  get tasks(): TaskView[] {
    return this.#state.tasks;
  }
}

export { GroupWithTasks };
