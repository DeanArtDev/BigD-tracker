import { GroupStatus, TaskStatus } from '@big-d/api-contracts';
import { GroupView } from './group.view';
import { TaskView } from './task.view';

interface GroupWithTasksViewState {
  readonly group: GroupView;
  readonly tasks: TaskView[];
}

class GroupWithTasksView {
  #group: GroupView;
  #tasks: TaskView[];

  constructor(state: GroupWithTasksViewState) {
    const { tasks, group } = state;
    this.#tasks = tasks;
    this.#group = group;
  }

  static restore(state: GroupWithTasksViewState): GroupWithTasksView {
    return new GroupWithTasksView({
      group: state.group,
      tasks: state.tasks,
    });
  }

  get id() {
    return this.#group.id;
  }

  get userId() {
    return this.#group.userId;
  }

  get name() {
    return this.#group.name;
  }

  get status() {
    if (this.#group.status === GroupStatus.DONE) {
      return this.#group.status;
    }

    if (this.#tasks.length === 0) {
      return GroupStatus.NOT_STARTED;
    }

    if (this.#tasks.every((t) => t.status === TaskStatus.NOT_STARTED)) {
      return GroupStatus.NOT_STARTED;
    }

    if (this.#tasks.every((t) => [TaskStatus.COMPLETED, TaskStatus.OVERDUE, TaskStatus.CANCELED].includes(t.status))) {
      return GroupStatus.DONE;
    }

    return GroupStatus.IN_PROGRESS;
  }

  get description() {
    return this.#group.description;
  }

  get tasks() {
    return [...this.#tasks];
  }

  get progress() {
    if (this.#group.status === GroupStatus.DONE) {
      return this.#group.progress;
    }

    const parts = this.#tasks.length;
    if (parts === 0) return 0;

    const partCost = Number((100 / parts).toFixed(1));

    const result = this.#tasks.reduce<number>((acc, task) => {
      if (task.status === TaskStatus.COMPLETED) {
        acc += partCost;
      }
      return acc;
    }, 0);

    return Number(result.toFixed(1));
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      status: this.status,
      description: this.description,
      progress: this.progress,
      tasks: this.tasks,
    };
  }
}

export { GroupWithTasksView, GroupWithTasksViewState };
