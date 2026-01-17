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

export { getGroupRaw };
