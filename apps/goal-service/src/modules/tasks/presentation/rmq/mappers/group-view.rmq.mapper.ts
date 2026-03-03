import { GroupWithTasksView } from '@/modules/tasks/application/dto';

class GroupViewRmqMapper {
  static fromViewToDtoWithTasks = (group: GroupWithTasksView): ReturnType<GroupWithTasksView['toJSON']> => {
    return group.toJSON();
  };
}

export { GroupViewRmqMapper };
