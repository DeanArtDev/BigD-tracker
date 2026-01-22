import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { Database, TaskTransaction, TasksReadRepository } from '@/modules/tasks/application/ports';
import { tasksQuerySpec } from '@/modules/tasks/domain';
import { TaskStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksReadKyselyMapper } from '../../mappers/tasks.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { getTasksWithStatusQuery } from '../helpers';

@Injectable()
export class TasksReadRepositoryKysely extends BaseTasksRepository implements TasksReadRepository {
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: Database) {
    super();
  }

  async getById(
    input: { userId: number; id: number },
    trx?: TaskTransaction,
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
    trx?: TaskTransaction,
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
    trx?: TaskTransaction,
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

  async getByRange(
    input: { userId: number; from: string; to: string },
    trx?: TaskTransaction,
  ): Promise<TaskView[]> {
    return await this.errorCatcher('tasks.get-by-range.read', async () => {
      const tasks = await getTasksWithStatusQuery(this.db, trx)
        .where('ts.name', 'in', tasksQuerySpec.readableStatuses)
        .where('t.user_id', '=', input.userId)
        .where('t.start_date', '<=', new Date(input.to))
        .where('t.deadline', '>=', new Date(input.from))
        .orderBy('t.start_date', 'asc')
        .execute();

      return tasks.map((task) => {
        return TasksReadKyselyMapper.fromRawToView({
          id: task.id,
          user_id: task.user_id,
          name: task.name,
          description: task.description,
          priority: task.priority,
          weight: task.weight,
          cancel_reason: task.cancel_reason,
          start_date: task.start_date,
          end_date: task.end_date,
          deadline: task.deadline,
          recurrence: task.recurrence,
          status: task.status as TaskStatus,
        });
      });
    });
  }
}
