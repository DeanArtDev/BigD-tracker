import { DB } from '@/infrastructure/types';
import { Database } from '@/modules/tasks/application/ports';
import { groupsQuerySpec } from '@/modules/tasks/domain';
import { getGroupWithStatusQuery } from './get-group-with-status.query';
import { Transaction } from 'kysely';

function getAvailableGroupQuery(db: Database<DB>, trx?: Transaction<DB>) {
  return getGroupWithStatusQuery(db, trx).where(
    'g.name',
    'not in',
    groupsQuerySpec.unavailableNames,
  );
}

export { getAvailableGroupQuery };
