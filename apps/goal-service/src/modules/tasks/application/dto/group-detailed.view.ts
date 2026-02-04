import { GroupWithTasksView } from './group-with-tasks.view';
import { GroupView } from './group.view';
import { TaskView } from './task.view';

interface GroupDetailedViewState {
  readonly group: GroupView;
  readonly tasks: TaskView[];
}

class GroupDetailedView extends GroupWithTasksView {
  constructor(state: GroupDetailedViewState) {
    super(state);
  }

  static restore(state: GroupDetailedViewState): GroupDetailedView {
    return GroupWithTasksView.restore({
      group: state.group,
      tasks: state.tasks,
    });
  }
}

export { GroupDetailedView, GroupDetailedViewState };
