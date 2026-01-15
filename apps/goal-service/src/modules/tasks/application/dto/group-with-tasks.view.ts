import { TaskView } from './task.view';
import { GroupStatus } from '@big-d/api-contracts';
import { GroupView } from './group.view';

interface GroupWithTasksViewState {
  readonly id: number;
  readonly userId: number;
  readonly progress: number;
  readonly name: string;
  readonly status: GroupStatus;
  readonly description?: string;
  readonly tasks: TaskView[];
}

class GroupWithTasksView extends GroupView {
  constructor(
    public readonly tasks: TaskView[],
    ...groupViewConstructor: ConstructorParameters<typeof GroupView>
  ) {
    super(...groupViewConstructor);
  }

  static restore(input: GroupWithTasksViewState): GroupWithTasksView {
    return new GroupWithTasksView(
      input.tasks,
      input.id,
      input.userId,
      input.progress,
      input.name,
      input.status,
      input.description,
    );
  }
}

export { GroupWithTasksView, GroupWithTasksViewState };
