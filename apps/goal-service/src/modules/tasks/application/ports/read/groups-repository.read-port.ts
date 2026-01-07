import { DB } from '@/infrastructure/types';
import { GroupView } from '@/modules/tasks/application/dto/group.view';
import { Transaction } from 'kysely';

interface GroupsReadRepository {
  getByName(
    input: { name: string; userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupView | null>;
  isGroupExists(input: { groupId: number }, trx?: Transaction<DB>): Promise<boolean>;
}

export { GroupsReadRepository };
