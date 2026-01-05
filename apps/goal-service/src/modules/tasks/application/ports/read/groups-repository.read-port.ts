import { DB } from '@/infrastructure/types';
import { Transaction } from 'kysely';

interface GroupsReadRepository {
  isGroupExists(input: { groupId: number }, trx?: Transaction<DB>): Promise<boolean>;
}

export { GroupsReadRepository };
