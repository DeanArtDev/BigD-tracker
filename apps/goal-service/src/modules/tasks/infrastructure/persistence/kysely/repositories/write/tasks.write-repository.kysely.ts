import {
  TaskDatabase,
  TaskTransaction,
  TasksWriteRepository,
} from '@/modules/tasks/application/ports';
import { Task } from '@/modules/tasks/domain';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksWriteKyselyMapper } from '../../mappers/tasks.write-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { getTasksWithStatusQuery } from '../helpers';

@Injectable()
export class TasksWriteRepositoryKysely
  extends BaseTasksRepository
  implements TasksWriteRepository
{
  #tableName = 'tasks' as const;

  constructor(@Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase) {
    super();
  }

  async getTaskById(
    input: { taskId: number; userId: number },
    trx?: TaskTransaction,
  ): Promise<Task | null> {
    return await this.errorCatcher('tasks.get-write-task-by-id', async () => {
      const task = await getTasksWithStatusQuery(this.db, trx)
        .where('t.id', '=', input.taskId)
        .where('t.user_id', '=', input.userId)
        .executeTakeFirst();
      if (task == null) return null;

      return TasksWriteKyselyMapper.fromRawToAgr(task);
    });
  }

  async createTask(agr: Task, trx?: TaskTransaction): Promise<Task> {
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
          priority: agr.priority,
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

  async replaceTask(task: Task, trx?: TaskTransaction): Promise<Task> {
    return await this.errorCatcher('tasks.replace', async () => {
      const { id: status_id } = await this.db
        .qb(trx)
        .selectFrom('task_statuses')
        .where('task_statuses.name', '=', task.status)
        .selectAll()
        .executeTakeFirstOrThrow();

      const result = await this.db
        .qb(trx)
        .updateTable(this.#tableName)
        .where('id', '=', task.id)
        .where('user_id', '=', task.userId)
        .set({
          name: task.name,
          description: task.description ?? null,
          priority: task.priority,
          weight: task.weight,
          start_date: task.startDate ?? null,
          end_date: task.endDate,
          deadline: task.deadline ?? null,
          recurrence: task.recurrence ?? null,
          status_id,
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
    trx?: TaskTransaction,
  ): Promise<void> {
    return await this.errorCatcher('tasks.add-to-group', async () => {
      const lastPosition = await this.db
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
          position: Number(lastPosition?.count ?? 0),
        })
        .executeTakeFirstOrThrow();
    });
  }

  async removeTaskFromGroup(input: { taskId: number }, trx?: TaskTransaction): Promise<void> {
    return await this.errorCatcher('tasks.remove-from-group', async () => {
      const qb = this.db.qb(trx);

      const taskToGroupLink = await qb
        .deleteFrom('task_to_group')
        .where('task_id', '=', input.taskId)
        .returning(['position', 'group_id'])
        .executeTakeFirst();
      if (taskToGroupLink == null) return;

      await qb
        .updateTable('task_to_group')
        .set((eb) => ({
          position: eb('position', '-', 1),
        }))
        .where('group_id', '=', taskToGroupLink.group_id)
        .where('position', '>', taskToGroupLink.position)
        .execute();
    });
  }

  async changeTaskStatus(task: Task, trx?: TaskTransaction): Promise<void> {
    return await this.errorCatcher('tasks.change-task-status', async () => {
      const { id, userId, status } = task;

      const { statusId } = await this.db
        .qb(trx)
        .selectFrom('task_statuses as ts')
        .where('ts.name', '=', status)
        .select(['id as statusId'])
        .executeTakeFirstOrThrow();

      await this.db
        .qb(trx)
        .updateTable(this.#tableName)
        .set({ status_id: statusId })
        .where('id', '=', id)
        .where('user_id', '=', userId)
        .executeTakeFirst();
    });
  }

  async deleteTask(
    input: { userId: number; taskId: number },
    trx?: TaskTransaction,
  ): Promise<boolean> {
    return await this.errorCatcher('tasks.task-deleting', async () => {
      const result = await this.db
        .qb(trx)
        .deleteFrom(this.#tableName)
        .where('id', '=', input.taskId)
        .where('user_id', '=', input.userId)
        .executeTakeFirst();

      return result.numDeletedRows > 0;
    });
  }
}
