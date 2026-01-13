import { DB } from '@/infrastructure/types';
import { GroupInboxView } from '@/modules/tasks/application/dto/group-inbox.view';
import { GroupsWriteRepository, INBOX_GROUP_KEY } from '@/modules/tasks/application/ports';
import { Database } from '@/modules/tasks/application/ports';
import { Group } from '@/modules/tasks/domain/aggregates/group';
import { GroupStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { GroupReadKyselyMapper } from '../../mappers/groups.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';

@Injectable()
export class GroupWriteRepositoryKysely
  extends BaseTasksRepository
  implements GroupsWriteRepository
{
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: Database<DB>) {
    super();
  }

  async createInbox(input: { userId: number }, trx?: Transaction<DB>): Promise<GroupInboxView> {
    return await this.errorCatcher('groups.inbox-creation', async () => {
      const groupStatus = await this.db
        .qb(trx)
        .selectFrom('group_statuses')
        .where('name', '=', GroupStatus.IN_PROGRESS)
        .select(['id', 'name'])
        .executeTakeFirstOrThrow();

      const result = await this.db
        .qb(trx)
        .insertInto('groups')
        .values({
          name: INBOX_GROUP_KEY,
          user_id: input.userId,
          status_id: groupStatus.id,
        })
        .returning(['id', 'name', 'user_id'])
        .executeTakeFirstOrThrow();

      return GroupReadKyselyMapper.fromRawToInboxView({
        id: result.id,
        name: result.name,
        user_id: result.user_id,
        tasks: [],
      });
    });
  }

  async createGroup(group: Group, trx?: Transaction<DB>): Promise<Group> {
    return await this.errorCatcher('groups.creation', async () => {
      const groupStatus = await this.db
        .qb(trx)
        .selectFrom('group_statuses')
        .where('name', '=', GroupStatus.NOT_STARTED)
        .select(['id', 'name'])
        .executeTakeFirstOrThrow();

      const result = await this.db
        .qb(trx)
        .insertInto('groups')
        .values({
          name: group.name,
          user_id: group.userId,
          description: group.description,
          status_id: groupStatus.id,
        })
        .returning(['id', 'name', 'user_id', 'progress', 'description'])
        .executeTakeFirstOrThrow();

      return GroupReadKyselyMapper.fromRawToAgr({
        id: result.id,
        name: result.name,
        user_id: result.user_id,
        status: groupStatus.name as GroupStatus,
        progress: result.progress,
        description: result.description,
        tasks: [],
      });
    });
  }
}
