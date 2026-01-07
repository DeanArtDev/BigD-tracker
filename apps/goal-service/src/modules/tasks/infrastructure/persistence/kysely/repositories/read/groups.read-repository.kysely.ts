import { DB } from '@/infrastructure/types';
import { GroupView } from '@/modules/tasks/application/dto/group.view';
import { GroupsReadRepository } from '@/modules/tasks/application/ports';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { BaseTasksRepository } from '../base-tasks.repository';
import { isGroupExists } from './helpers';
import { GroupReadKyselyMapper } from '../../mappers/groups.read-mapper';

@Injectable()
export class GroupsReadRepositoryKysely
  extends BaseTasksRepository
  implements GroupsReadRepository
{
  #tableName = 'groups' as const;

  constructor(@Inject(databaseToken.CONNECTION) private readonly db: Database<DB>) {
    super();
  }

  async getByName(
    input: { name: string; userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupView | null> {
    return await this.errorCatcher('groups.get-by-name', async () => {
      const result = await this.db
        .qb(trx)
        .selectFrom(this.#tableName)
        .where('name', '=', input.name)
        .where('user_id', '=', input.userId)
        .select(['id', 'user_id', 'description', 'name', 'status_id', 'progress'])
        .executeTakeFirst();
      if (result == null) return null;

      const status = await this.db
        .qb(trx)
        .selectFrom('group_statuses')
        .where('id', '=', result.status_id)
        .select(['name'])
        .executeTakeFirst();
      if (status == null) return null;

      return GroupReadKyselyMapper.fromRawToView({
        id: result.id,
        name: result.name,
        description: result.description,
        user_id: result.user_id,
        progress: result.progress,
        status: status.name,
      });
    });
  }

  async isGroupExists(
    input: { groupId: number } | { name: string },
    trx?: Transaction<DB>,
  ): Promise<boolean> {
    return await this.errorCatcher('groups.is-group-exists', async () => {
      return isGroupExists(this.db, input, trx);
    });
  }
}
