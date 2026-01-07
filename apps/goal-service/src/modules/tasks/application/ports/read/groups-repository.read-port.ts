import { DB } from '@/infrastructure/types';
import { GroupInboxView } from '@/modules/tasks/application/dto/group-inbox.view';
import { GroupView } from '@/modules/tasks/application/dto/group.view';
import { Transaction } from 'kysely';

interface GroupsReadRepository {
  getByName(
    input: { name: string; userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupView | null>;

  getInboxWithTasksByUserId(
    input: { userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupInboxView | null>;

  isGroupExists(input: { groupId: number }, trx?: Transaction<DB>): Promise<boolean>;

  ensureTaskInInboxGroup(
    input: { userId: number; taskId: number },
    trx?: Transaction<DB>,
  ): Promise<{ success: false } | { success: true; inboxId: number }>;
}

export { GroupsReadRepository };
