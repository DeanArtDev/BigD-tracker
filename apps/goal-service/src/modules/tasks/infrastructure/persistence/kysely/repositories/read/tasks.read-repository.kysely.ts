import { DB } from '@/infrastructure/types';
import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { Database, TasksReadRepository } from '@/modules/tasks/application/ports';
import { TaskStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { TasksReadKyselyMapper } from '../../mappers/tasks.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { getTasksWithStatusQuery } from '../helpers';

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

      const result = await getTasksWithStatusQuery(this.db, trx)
        .where('t.id', '=', id)
        .where('t.user_id', '=', userId)
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

  async getTaskToGroupLink(
    input: { taskId: number },
    trx?: Transaction<DB>,
  ): Promise<{ taskId: number; groupId: number; position: number } | null> {
    return await this.errorCatcher('tasks.get-task-to-group-link.read', async () => {
      const result = await this.db
        .qb(trx)
        .selectFrom('task_to_group')
        .where('task_id', '=', input.taskId)
        .selectAll()
        .executeTakeFirst();

      if (result == null) return null;
      return {
        taskId: result.task_id,
        groupId: result.group_id,
        position: result.position,
      };
    });
  }
}
