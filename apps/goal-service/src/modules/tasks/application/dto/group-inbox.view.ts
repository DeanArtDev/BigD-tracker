import { TaskView } from './task.view';

interface GroupInboxViewState {
  readonly id: number;
  readonly userId: number;
  readonly name: string;
  readonly tasks: TaskView[];
}

class GroupInboxView {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly name: string,
    public tasks: TaskView[],
  ) {}

  static restore(input: GroupInboxViewState): GroupInboxView {
    return new GroupInboxView(input.id, input.userId, input.name, input.tasks);
  }
}

export { GroupInboxView, GroupInboxViewState };
