import { GroupInboxView } from '@/modules/tasks/application/dto';
import { TaskDatabase, GroupInboxReadRepository, TaskTransaction } from '@/modules/tasks/application/ports';
import { tasksAreInInboxSpec } from '@/modules/tasks/domain';
import { leftJoinTaskRecurrences, tasksWithStatusQuery } from '../utils';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupReadKyselyMapper } from '../../mappers/groups.read-mapper';
import { TasksReadKyselyMapper } from '../../mappers/tasks.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { getInboxByUserIdQuery } from '../helpers';

@Injectable()
export class GroupInboxReadRepositoryKysely extends BaseTasksRepository implements GroupInboxReadRepository {
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase) {
    super();
  }

  async getInboxWithTasksByUserId(input: { userId: number }, trx?: TaskTransaction): Promise<GroupInboxView | null> {
    return await this.errorCatcher('inbox-group.get-inbox-by-user-id-with-tasks', async () => {
      const inbox = await getInboxByUserIdQuery(this.db, input, trx).executeTakeFirst();
      if (inbox == null) return null;

      const query = tasksWithStatusQuery(this.db, trx)
        .where('tasks.group_id', '=', inbox.id)
        .where('task_statuses.name', 'in', tasksAreInInboxSpec.default);
      const tasks = await leftJoinTaskRecurrences(query).orderBy('tasks.id', 'asc').execute();

      return GroupReadKyselyMapper.fromRawToInboxView({
        id: inbox.id,
        name: inbox.name,
        user_id: inbox.user_id,
        tasks: tasks.map((task) =>
          TasksReadKyselyMapper.fromRawToView({
            id: task.id,
            user_id: task.user_id,
            name: task.name,
            group_id: inbox.id,
            description: task.description,
            priority: task.priority,
            weight: task.weight,
            cancel_reason: task.cancel_reason,
            start_date: task.start_date,
            end_date: task.end_date,
            deadline: task.deadline,
            status: task.status,
            recurrence: {
              timezone: task.recurrence_timezone,
              recurrence_frequency: task.recurrence_frequency,
              start_date: task.start_date,
              interval: task.recurrence_interval,
              weekdays: task.recurrence_weekdays,
              monthdays: task.recurrence_monthdays,
              yearmonths: task.recurrence_yearmonths,
              until_date: task.recurrence_until_date,
            },
          }),
        ),
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
