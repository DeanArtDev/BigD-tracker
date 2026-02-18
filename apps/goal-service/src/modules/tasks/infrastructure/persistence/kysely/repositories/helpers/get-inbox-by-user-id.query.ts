import { TaskTransaction } from '@/modules/tasks/application/ports';
import { TaskDatabase } from '@/modules/tasks/application/ports';
import { INBOX_GROUP_NAME } from '@/modules/tasks/domain/constants';

function getInboxByUserIdQuery(db: TaskDatabase, input: { userId: number }, trx?: TaskTransaction) {
  return db
    .qb(trx)
    .selectFrom('groups as g')
    .leftJoin('task_to_group as ttg', 'ttg.group_id', 'g.id')
    .where('g.name', '=', INBOX_GROUP_NAME)
    .where('g.user_id', '=', input.userId)
    .select(['g.id as id', 'g.user_id as user_id', 'g.name as name']);
}

export { getInboxByUserIdQuery };
