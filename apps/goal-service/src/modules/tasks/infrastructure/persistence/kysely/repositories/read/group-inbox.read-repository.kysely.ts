import { GroupInboxView } from '@/modules/tasks/application/dto';
import { GroupInboxReadRepository, TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupReadKyselyMapper } from '../../mappers/groups.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { getInboxByUserIdQuery } from '../helpers';

@Injectable()
export class GroupInboxReadRepositoryKysely extends BaseTasksRepository implements GroupInboxReadRepository {
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase) {
    super();
  }

  async getInboxByUserId(input: { userId: number }, trx?: TaskTransaction): Promise<GroupInboxView | null> {
    return await this.errorCatcher('inbox-group.get-inbox-by-user-id-with-tasks', async () => {
      const inbox = await getInboxByUserIdQuery(this.db, input, trx).executeTakeFirst();
      if (inbox == null) return null;

      const tasksData = await this.db
        .qb(trx)
        .selectFrom('tasks')
        .select((eb) => eb.fn.count<number>('id').as('count'))
        .where('group_id', '=', inbox.id)
        .executeTakeFirst();

      return GroupReadKyselyMapper.fromRawToInboxView({
        id: inbox.id,
        name: inbox.name,
        user_id: inbox.user_id,
        task_count: tasksData?.count ?? 0,
      });
    });
  }

  async ensureTaskInInbox(
    input: { userId: number; taskId: number },
    trx?: TaskTransaction,
  ): Promise<{ inboxId: number; success: boolean }> {
    return await this.errorCatcher('inbox-group.is-task-in-inbox', async () => {
      const inbox = await getInboxByUserIdQuery(this.db, { userId: input.userId }, trx).executeTakeFirst();
      if (inbox == null) return { success: false, inboxId: NaN };

      const tasks = await this.db
        .qb(trx)
        .selectFrom('tasks')
        .where('group_id', '=', inbox.id)
        .where('id', '=', input.taskId)
        .execute();

      return {
        inboxId: inbox.id,
        success: tasks.length > 0,
      };
    });
  }
}
