import { DB } from '@/infrastructure/types';
import { TasksWriteRepository } from '@/modules/tasks/application/ports';
import { Task } from '@/modules/tasks/domain';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { TasksWriteKyselyMapper } from '../../mappers/tasks.write-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';

@Injectable()
export class TasksWriteRepositoryKysely
  extends BaseTasksRepository
  implements TasksWriteRepository
{
  #tableName = 'tasks' as const;

  constructor(@Inject(databaseToken.CONNECTION) private readonly db: Database<DB>) {
    super();
  }

  async getTaskById(
    input: { id: number; userId: number },
    trx?: Transaction<DB>,
  ): Promise<Task | null> {
    return await this.errorCatcher('tasks.get-write-task-by-id', async () => {
      const task = await this.db
        .qb(trx)
        .selectFrom('tasks as t')
        .innerJoin('task_statuses as ts', 't.status_id', 'ts.id')
        .where('t.id', '=', input.id)
        .where('t.user_id', '=', input.userId)
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
      if (task == null) return null;

      return TasksWriteKyselyMapper.fromRawToAgr(task);
    });
  }

  async createTask(agr: Task, trx?: Transaction<DB>): Promise<Task> {
    return await this.errorCatcher('tasks.creation', async () => {
      const { statusId, statusName } = await this.db
        .qb(trx)
        .selectFrom('task_statuses')
        .where('task_statuses.name', '=', agr.status)
        .select(['id as statusId', 'name as statusName'])
        .executeTakeFirstOrThrow();

      const task = await this.db
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
          'recurrence',
        ])
        .executeTakeFirstOrThrow();

      return TasksWriteKyselyMapper.fromRawToAgr({ ...task, status: statusName });
    });
  }

  async replaceTask(task: Task, trx?: Transaction<DB>): Promise<Task> {
    return await this.errorCatcher('tasks.replace', async () => {
      const result = await this.db
        .qb(trx)
        .updateTable(this.#tableName)
        .where('id', '=', task.id)
        .where('user_id', '=', task.userId)
        .set({
          name: task.name,
          description: task.description,
          priority: task.priority,
          weight: task.weight,
          start_date: task.startDate,
          end_date: task.endDate,
          deadline: task.deadline,
          recurrence: task.recurrence,
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
          'recurrence',
        ])
        .executeTakeFirstOrThrow();

      return TasksWriteKyselyMapper.fromRawToAgr({ ...result, status: task.status });
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
