import { TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';
import { groupsQuerySpec } from '@/modules/tasks/domain';
import { getGroupWithStatusQuery } from './get-group-with-status.query';

function getAvailableGroupQuery(db: TaskDatabase, trx?: TaskTransaction) {
  return getGroupWithStatusQuery(db, trx).where(
    'g.name',
    'not in',
    groupsQuerySpec.unavailableNames,
  );
}

export { getAvailableGroupQuery };
