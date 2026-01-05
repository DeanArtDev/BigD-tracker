import { DB } from '@/infrastructure/types';
import { TasksWriteRepository } from '@/modules/tasks/application/ports';
import { Task } from '@/modules/tasks/domain';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { BaseTasksRepository } from '../base-tasks.repository';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';

@Injectable()
export class TasksWriteRepositoryKysely
  extends BaseTasksRepository
  implements TasksWriteRepository
{
  #tableName = 'tasks' as const;

  constructor(@Inject(databaseToken.CONNECTION) private readonly db: Database<DB>) {
    super();
  }

  async createTask(agr: Task, trx?: Transaction<DB>): Promise<{ id: number }> {
    return await this.errorCatcher('tasks.creation', async () => {
      const { statusId } = await this.db
        .qb(trx)
        .selectFrom('task_statuses')
        .where('task_statuses.name', '=', agr.status)
        .select(['id as statusId', 'name as statusName'])
        .executeTakeFirstOrThrow();

      const result = await this.db
        .qb(trx)
        .insertInto(this.#tableName)
        .values({
          cancel_reason: agr.cancelReason,
          name: agr.name,
          deadline: agr.deadline,
          end_date: agr.endDate,
          start_date: agr.startDate,
          description: agr.description,
          user_id: agr.userId,
          status_id: statusId,
        })
        .returning(['id'])
        .executeTakeFirstOrThrow();

      return { id: result.id };
    });
  }

  async addTaskToGroup(
    input: { groupId: number; taskId: number },
    trx?: Transaction<DB>,
  ): Promise<void> {
    return await this.errorCatcher('tasks.add-to-group', async () => {
      const position = await this.db
        .qb(trx)
        .selectFrom('task_to_group')
        .select((eb) => eb.fn.count('task_id').as('count'))
        .where('group_id', '=', input.groupId)
        .executeTakeFirst();

      await this.db
        .qb(trx)
        .insertInto('task_to_group')
        .values({
          group_id: input.groupId,
          task_id: input.taskId,
          position: Number(position?.count ?? 0),
        })
        .executeTakeFirstOrThrow();
    });
  }
}
