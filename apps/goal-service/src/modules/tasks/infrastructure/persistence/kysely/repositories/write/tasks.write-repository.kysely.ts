import { TaskDatabase, TasksWriteRepository, TaskTransaction } from '@/modules/tasks/application/ports';
import { Task } from '@/modules/tasks/domain';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksWriteKyselyMapper } from '../../mappers/tasks.write-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { leftJoinTaskRecurrences, statusByNameQuery, tasksWithStatusQuery } from '../utils';

@Injectable()
export class TasksWriteRepositoryKysely extends BaseTasksRepository implements TasksWriteRepository {
  #tableName = 'tasks' as const;

  constructor(@Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase) {
    super();
  }

  async getTaskById(input: { taskId: number; userId: number }, trx?: TaskTransaction): Promise<Task | null> {
    return await this.errorCatcher('tasks.get-write-task-by-id', async () => {
      const query = tasksWithStatusQuery(this.db, trx)
        .where('tasks.id', '=', input.taskId)
        .where('tasks.user_id', '=', input.userId);
      const task = await leftJoinTaskRecurrences(query).executeTakeFirst();
      if (task == null) return null;

      return TasksWriteKyselyMapper.fromRawToAgr(task);
    });
  }

  async createTask(task: Task, trx?: TaskTransaction): Promise<Task> {
    return await this.errorCatcher('tasks.creation', async () => {
      const { id: status_id, name: status_name } = await statusByNameQuery(
        [task.status],
        this.db,
        trx,
      ).executeTakeFirstOrThrow();

      const taskResponse = await this.db
        .qb(trx)
        .insertInto(this.#tableName)
        .values({
          cancel_reason: task.cancelReason,
          name: task.name,
          deadline: task.deadline,
          end_date: task.endDate,
          start_date: task.startDate,
          description: task.description,
          user_id: task.userId,
          group_id: task.groupId,
          priority: task.priority,
          status_id,
        })
        .returning([
          'id',
          'user_id',
          'group_id',
          'name',
          'description',
          'priority',
          'cancel_reason',
          'start_date',
          'end_date',
          'deadline',
        ])
        .executeTakeFirstOrThrow();

      if (task.groupId != null) {
        await this.#syncGroupLinks({ groupId: task.groupId, taskId: taskResponse.id }, trx);
      }

      return TasksWriteKyselyMapper.fromRawToAgr({ ...taskResponse, status: status_name });
    });
  }

  async replaceTask(task: Task, trx?: TaskTransaction): Promise<Task> {
    return await this.errorCatcher('tasks.replace', async () => {
      const { id: status_id } = await statusByNameQuery([task.status], this.db, trx).executeTakeFirstOrThrow();

      await this.#syncGroupLinks({ groupId: task.groupId, taskId: task.id }, trx);

      const result = await this.db
        .qb(trx)
        .updateTable(this.#tableName)
        .where('id', '=', task.id)
        .where('user_id', '=', task.userId)
        .set({
          name: task.name,
          description: task.description ?? null,
          group_id: task.groupId ?? null,
          priority: task.priority,
          start_date: task.startDate ?? null,
          end_date: task.endDate,
          deadline: task.deadline ?? null,
          cancel_reason: task.cancelReason ?? null,
          status_id,
        })
        .returning([
          'id',
          'user_id',
          'group_id',
          'name',
          'description',
          'priority',
          'cancel_reason',
          'start_date',
          'end_date',
          'deadline',
        ])
        .executeTakeFirstOrThrow();

      const recurrence = await this.db
        .qb(trx)
        .selectFrom('tasks_recurrences')
        .where('tasks_recurrences.task_id', '=', result.id)
        .select(['tasks_recurrences.id'])
        .executeTakeFirst();

      return TasksWriteKyselyMapper.fromRawToAgr({ ...result, status: task.status, recurrence_id: recurrence?.id });
    });
  }

  async deleteTask(input: { userId: number; taskId: number }, trx?: TaskTransaction): Promise<boolean> {
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

  async #syncGroupLinks(input: { groupId?: number; taskId: number }, trx?: TaskTransaction): Promise<void> {
    return await this.errorCatcher('tasks.sync-group-links', async () => {
      const currentLink = await this.db
        .qb(trx)
        .selectFrom('task_to_group')
        .select(['group_id', 'position'])
        .where('task_id', '=', input.taskId)
        .executeTakeFirst();

      if (input.groupId == null) {
        await this.#deleteGroupLink({ taskId: input.taskId }, trx);
        return;
      }

      if (currentLink == null) {
        await this.#createGroupLink({ groupId: input.groupId, taskId: input.taskId }, trx);
        return;
      }

      if (currentLink.group_id === input.groupId) {
        return;
      }

      await this.#updateGroupLink(
        {
          taskId: input.taskId,
          groupId: input.groupId,
          previousGroupId: currentLink.group_id,
          previousPosition: currentLink.position,
        },
        trx,
      );
    });
  }

  async #createGroupLink(input: { groupId: number; taskId: number }, trx?: TaskTransaction): Promise<void> {
    return await this.errorCatcher('tasks.create-group-link', async () => {
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

  async #updateGroupLink(
    input: { taskId: number; groupId: number; previousGroupId: number; previousPosition: number },
    trx?: TaskTransaction,
  ): Promise<void> {
    return await this.errorCatcher('tasks.update-group-link', async () => {
      const qb = this.db.qb(trx);

      await qb
        .updateTable('task_to_group')
        .set((eb) => ({
          position: eb('position', '-', 1),
        }))
        .where('group_id', '=', input.previousGroupId)
        .where('position', '>', input.previousPosition)
        .execute();

      const lastPosition = await qb
        .selectFrom('task_to_group')
        .select((eb) => eb.fn.count('task_id').as('count'))
        .where('group_id', '=', input.groupId)
        .executeTakeFirst();

      await qb
        .updateTable('task_to_group')
        .set({
          group_id: input.groupId,
          position: Number(lastPosition?.count ?? 0),
        })
        .where('task_id', '=', input.taskId)
        .executeTakeFirstOrThrow();
    });
  }

  async #deleteGroupLink(input: { taskId: number }, trx?: TaskTransaction): Promise<void> {
    return await this.errorCatcher('tasks.delete-group-link', async () => {
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
}
