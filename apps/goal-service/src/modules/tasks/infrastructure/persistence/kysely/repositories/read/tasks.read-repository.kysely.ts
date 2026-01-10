import { DB } from '@/infrastructure/types';
import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { TasksReadRepository } from '@/modules/tasks/application/ports';
import { Database } from '@/modules/tasks/application/ports';
import { TasksReadKyselyMapper } from '../../mappers/tasks.read-mapper';
import { TaskStatus } from '@big-d/api-contracts';
import { BaseTasksRepository } from '../base-tasks.repository';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';

@Injectable()
export class TasksReadRepositoryKysely extends BaseTasksRepository implements TasksReadRepository {
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: Database<DB>) {
    super();
  }

  async getById(
    input: { userId: number; id: number },
    trx?: Transaction<DB>,
  ): Promise<TaskView | null> {
    return await this.errorCatcher('tasks.get-by-id', async () => {
      const { id, userId } = input;

      const result = await this.db
        .qb(trx)
        .selectFrom('tasks as t')
        .innerJoin('task_statuses as ts', 't.status_id', 'ts.id')
        .where('t.id', '=', id)
        .where('t.user_id', '=', userId)
        .select([
          't.id as id',
          't.user_id as user_id',
          't.name as name',
          't.description as description',
          't.priority as priority',
          't.weight as weight',
          't.cancel_reason as cancel_reason',
          't.start_date as start_date',
          't.end_date as end_date',
          't.deadline as deadline',
          't.recurrence as recurrence',
          'ts.name as status',
        ])
        .executeTakeFirst();
      if (result == null) return null;

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
        status: result.status as TaskStatus,
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
