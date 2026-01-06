import { DB } from '@/infrastructure/types';
import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { TasksReadRepository } from '@/modules/tasks/application/ports';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { TasksReadKyselyMapper } from './tasks.read-mapper';
import { TaskStatus } from '@big-d/api-contracts';
import { BaseTasksRepository } from '../base-tasks.repository';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';

@Injectable()
export class TasksReadRepositoryKysely extends BaseTasksRepository implements TasksReadRepository {
  #tableName = 'tasks' as const;

  constructor(@Inject(databaseToken.CONNECTION) private readonly db: Database<DB>) {
    super();
  }

  async getById(input: { userId: number; id: number }, trx?: Transaction<DB>): Promise<TaskView> {
    return await this.errorCatcher('tasks.creation', async () => {
      const { id, userId } = input;

      const result = await this.db
        .qb(trx)
        .selectFrom(this.#tableName)
        .where('id', '=', id)
        .where('user_id', '=', userId)
        .select([
          'id',
          'user_id',
          'name',
          'description',
          'priority',
          'weight',
          'cancel_reason',
          'start_date',
          'end_date',
          'deadline',
          'status_id',
          'recurrence',
        ])
        .executeTakeFirstOrThrow();

      const { statusName } = await this.db
        .qb(trx)
        .selectFrom('task_statuses')
        .where('task_statuses.id', '=', result.status_id)
        .select(['name as statusName'])
        .executeTakeFirstOrThrow();

      return TasksReadKyselyMapper.fromRawToView({
        id: result.id,
        user_id: result.user_id,
        name: result.name,
        description: result.description,
        priority: result.priority,
        weight: result.weight,
        cancel_reason: result.cancel_reason,
        start_date: result.start_date,
        end_date: result.end_date,
        deadline: result.deadline,
        recurrence: result.recurrence,
        status: statusName as TaskStatus,
      });
    });
  }

  async isTaskIntoGroup(
    input: { taskId: number; groupId: number },
    trx?: Transaction<DB>,
  ): Promise<boolean> {
    return await this.errorCatcher('tasks.is-task-into-group', async () => {
      const result = await this.db
        .qb(trx)
        .selectFrom('task_to_group')
        .where('group_id', '=', input.groupId)
        .where('task_id', '=', input.taskId)
        .executeTakeFirst();

      return result != null;
    });
  }
}
