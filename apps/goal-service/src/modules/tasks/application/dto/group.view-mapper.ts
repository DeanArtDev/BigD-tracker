import { Group } from '@/modules/tasks/domain/aggregates/group';
import { GroupView } from './group.view';

class GroupsViewMapper {
  static fromAggregateToView = (agr: Group): GroupView => {
    return GroupView.restore({
      id: agr.id,
      name: agr.name,
      status: agr.status,
      progress: agr.progress,
      description: agr.description,
      userId: agr.userId,
    });
  };
}

export { GroupsViewMapper };
