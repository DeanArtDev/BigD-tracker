import { DB } from '@/infrastructure/types';
import { GroupInboxView } from '@/modules/tasks/application/dto';
import { Database, GroupInboxReadRepository } from '@/modules/tasks/application/ports';
import { tasksAreInInboxSpec } from '@/modules/tasks/domain';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { GroupReadKyselyMapper } from '../../mappers/groups.read-mapper';
import { TasksReadKyselyMapper } from '../../mappers/tasks.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { getInboxByUserIdQuery, getTasksWithStatusQuery } from '../helpers';

@Injectable()
export class GroupInboxReadRepositoryKysely
  extends BaseTasksRepository
  implements GroupInboxReadRepository
{
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: Database<DB>) {
    super();
  }

  async getInboxWithTasksByUserId(
    input: { userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupInboxView | null> {
    return await this.errorCatcher('inbox-group.get-inbox-by-user-id-with-tasks', async () => {
      const inbox = await getInboxByUserIdQuery(this.db, input, trx).executeTakeFirst();
      if (inbox == null) return null;

      const tasks = await getTasksWithStatusQuery(this.db, trx)
        .innerJoin('task_to_group as ttg', 't.id', 'ttg.task_id')
        .where('ttg.group_id', '=', inbox.id)
        .where('ts.name', 'in', tasksAreInInboxSpec.default)
        .orderBy('t.id', 'asc')
        .execute();

      return GroupReadKyselyMapper.fromRawToInboxView({
        id: inbox.id,
        name: inbox.name,
        user_id: inbox.user_id,
        tasks: tasks.map(TasksReadKyselyMapper.fromRawToView),
      });
    });
  }

  async ensureTaskInInbox(
    input: { userId: number; taskId: number },
    trx?: Transaction<DB>,
  ): Promise<{ inboxId: number; success: boolean }> {
    return await this.errorCatcher('inbox-group.is-task-in-inbox', async () => {
      const inbox = await getInboxByUserIdQuery(
        this.db,
        { userId: input.userId },
        trx,
      ).executeTakeFirst();
      if (inbox == null) return { success: false, inboxId: NaN };

      const tasks = await this.db
        .qb(trx)
        .selectFrom('task_to_group')
        .where('group_id', '=', inbox.id)
        .where('task_id', '=', input.taskId)
        .execute();

      return {
        inboxId: inbox.id,
        success: tasks.length > 0,
      };
    });
  }
}
