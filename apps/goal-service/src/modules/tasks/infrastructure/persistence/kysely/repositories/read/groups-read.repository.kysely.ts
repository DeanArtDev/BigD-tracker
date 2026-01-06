import { DB } from '@/infrastructure/types';
import { GroupsReadRepository } from '@/modules/tasks/application/ports';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { BaseTasksRepository } from '../base-tasks.repository';

@Injectable()
export class GroupsReadRepositoryKysely
  extends BaseTasksRepository
  implements GroupsReadRepository
{
  #tableName = 'groups' as const;

  constructor(@Inject(databaseToken.CONNECTION) private readonly db: Database<DB>) {
    super();
  }

  async isGroupExists(input: { groupId: number }, trx?: Transaction<DB>): Promise<boolean> {
    return await this.errorCatcher('groups.is-group-exists', async () => {
      const result = await this.db
        .qb(trx)
        .selectFrom(this.#tableName)
        .where('id', '=', input.groupId)
        .executeTakeFirst();

      return result != null;
    });
  }
}
