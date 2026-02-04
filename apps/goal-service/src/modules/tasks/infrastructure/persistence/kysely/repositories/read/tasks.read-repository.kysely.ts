import { TaskView } from '@/modules/tasks/application/dto/task.view';
import {
  TaskDatabase,
  TaskTransaction,
  TasksReadRepository,
  TasksShapeTypes,
} from '@/modules/tasks/application/ports';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { tasksQuerySpec } from '@/modules/tasks/domain';
import { TaskStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksReadKyselyMapper } from '../../mappers/tasks.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { getTasksWithStatusQuery } from '../helpers';
import { taskFullSelect, tasksWithStatusQuery } from '../utils';

@Injectable()
export class TasksReadRepositoryKysely extends BaseTasksRepository implements TasksReadRepository {
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase) {
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

      return this.#map(result);
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

      return tasks.map(this.#map);
    });
  }

  async getMany(
    shapes: TasksShapeTypes[],
    specifications: TasksSpecification,
    trx?: TaskTransaction,
  ): Promise<TaskView[]> {
    return await this.errorCatcher('tasks.get-many.read', async () => {
      let query = tasksWithStatusQuery(this.db, trx);

      const shapeMap = {
        with_group_links_left_join: (qb: typeof query) =>
          qb.leftJoin('task_to_group', 'task_to_group.task_id', 'tasks.id'),
        with_group_links_inner_join: (qb: typeof query) =>
          qb.innerJoin('task_to_group', 'task_to_group.task_id', 'tasks.id'),
      };

      for (const shape of shapes) {
        const apply = shapeMap[shape](query);
        apply != null && (query = apply);
      }

      const tasks = await taskFullSelect(query)
        .where((eb) => specifications.toExpr(eb))
        .orderBy('id', 'asc')
        .execute();

      return tasks.map(this.#map);
    });
  }

  #map = (raw: {
    status: string;
    id: number;
    user_id: number;
    name: string;
    description: string | null;
    priority: number;
    weight: number;
    cancel_reason: string | null;
    start_date: Date | null;
    end_date: Date | null;
    deadline: Date | null;
    recurrence: string | null;
  }): TaskView => {
    return TasksReadKyselyMapper.fromRawToView({
      id: raw.id,
      user_id: raw.user_id,
      name: raw.name,
      description: raw.description,
      priority: raw.priority,
      weight: raw.weight,
      cancel_reason: raw.cancel_reason,
      start_date: raw.start_date,
      end_date: raw.end_date,
      deadline: raw.deadline,
      recurrence: raw.recurrence,
      status: raw.status as TaskStatus,
    });
  };
}
