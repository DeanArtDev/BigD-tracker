import { DB } from '@/infrastructure/types';
import { GroupInboxView } from '@/modules/tasks/application/dto';
import {
  Database,
  GroupInboxWriteRepository,
  INBOX_GROUP_KEY,
} from '@/modules/tasks/application/ports';
import { GroupStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { GroupReadKyselyMapper } from '../../mappers/groups.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';

@Injectable()
export class GroupInboxWriteRepositoryKysely
  extends BaseTasksRepository
  implements GroupInboxWriteRepository
{
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: Database<DB>) {
    super();
  }

  async createInbox(input: { userId: number }, trx?: Transaction<DB>): Promise<GroupInboxView> {
    return await this.errorCatcher('group-inbox.inbox-creation', async () => {
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
}
