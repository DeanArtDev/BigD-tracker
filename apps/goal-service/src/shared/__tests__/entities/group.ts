import { GroupDetailedView, TaskView } from '@/modules/tasks/application/dto';
import { GroupWithTasks } from '@/modules/tasks/domain/aggregates/group';
import {
  GroupReadKyselyMapper,
  RawGroupWithTasks,
} from '@/modules/tasks/infrastructure/persistence/kysely/mappers/groups.read-mapper';
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

const getGroupWithTasks = (
  data: Partial<RawGroup> & { tasks?: TaskView[] } = {},
): GroupWithTasks => {
  const groupRaw = getGroupRaw(data);

  return GroupWriteKyselyMapper.fromRawToAgrWithTasks({
    ...groupRaw,
    tasks: data.tasks ?? [],
  });
};

const getGroupDetailedView = (data: Partial<RawGroupWithTasks> = {}): GroupDetailedView => {
  const groupRaw = getGroupRaw(data);

  return GroupReadKyselyMapper.fromRawToDetailedView({
    ...groupRaw,
    tasks: data.tasks ?? [],
  });
};

export { getGroupDetailedView, getGroupRaw, getGroupWithTasks };
