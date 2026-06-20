import { GroupInfoView, GroupView, GroupWithTasksView, TaskView } from '@/modules/tasks/application/dto';
import { Task } from '@/modules/tasks/domain';
import { GroupWithTasks } from '@/modules/tasks/domain/aggregates/group';
import { GroupWriteKyselyMapper } from '@/modules/tasks/infrastructure/persistence/kysely/mappers/groups.write-mapper';
import { RawGroup } from '@/modules/tasks/infrastructure/persistence/kysely/mappers/groups.read-mapper';
import { GroupStatus } from '@big-d/api-contracts';

const getGroupRaw = (data: Partial<RawGroup> = {}): RawGroup => {
  return {
    id: 1,
    description: 'description',
    status: GroupStatus.NOT_STARTED,
    name: 'group name',
    user_id: 1,
    progress: 0,
    ...data,
  };
};

const getGroupWithTasks = (data: Partial<RawGroup> & { tasks?: Task[] } = {}): GroupWithTasks => {
  const groupRaw = getGroupRaw(data);

  return GroupWriteKyselyMapper.fromRawToAgrWithTasks({
    ...groupRaw,
    tasks: data.tasks ?? [],
  });
};

const getGroupView = (data: Partial<RawGroup> = {}): GroupView => {
  const groupRaw = getGroupRaw(data);

  return GroupView.restore({
    id: groupRaw.id,
    userId: groupRaw.user_id,
    progress: groupRaw.progress,
    name: groupRaw.name,
    status: groupRaw.status,
    description: groupRaw.description ?? undefined,
  });
};

const getGroupDetailedView = (data: Partial<RawGroup> & { tasks?: TaskView[] } = {}): GroupWithTasksView => {
  return GroupWithTasksView.restore({
    group: getGroupView(data),
    tasks: data.tasks ?? [],
  });
};

const getGroupInfoView = (data: Partial<{ id: number; name: string }> = {}): GroupInfoView => {
  return GroupInfoView.restore({
    id: data.id ?? 1,
    name: data.name ?? 'group name',
  });
};

export { getGroupDetailedView, getGroupInfoView, getGroupRaw, getGroupView, getGroupWithTasks };
