import { DB } from '@/infrastructure/types';
import { TasksRepository } from '@/modules/tasks/application/ports';
import { Task } from '@/modules/tasks/domain';
import { databaseToken, KyselyDatabase } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { TasksKyselyMapper } from '../tasks.mapper';
import { BaseTasksRepository } from './base-tasks.repository';

@Injectable()
export class TasksRepositoryKysely extends BaseTasksRepository implements TasksRepository {
  #tableName = 'tasks' as const;

  constructor(@Inject(databaseToken.CONNECTION) private readonly db: KyselyDatabase<DB>) {
    super();
  }

  async createTask(agr: Task, trx?: Transaction<DB>): Promise<Task | null> {
    return await this.errorCatcher('tasks.creation', async () => {
      const { statusId, statusName } = await this.db
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
        .returning([
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

      return TasksKyselyMapper.fromRawToAgr({
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
        status: statusName,
      });
    });
  }
}
