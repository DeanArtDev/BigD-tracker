import { TaskView } from '@/modules/tasks/application/dto';
import {
  TaskDatabase,
  TasksReadRepository,
  TasksShapeTypes,
  TaskTransaction,
} from '@/modules/tasks/application/ports';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { TaskStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { TasksReadKyselyMapper } from '../../mappers/tasks.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { getTasksWithStatusQuery } from '../helpers';
import { leftJoinGroupLinks, taskFullSelect, tasksWithStatusQuery } from '../utils';

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
        .leftJoin('task_to_group', 'task_to_group.task_id', 't.id')
        .select(['task_to_group.group_id as group_id'])
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

  async getByRange(specifications: TasksSpecification, trx?: TaskTransaction): Promise<TaskView[]> {
    return await this.errorCatcher('tasks.get-by-range.read', async () => {
      const tasks = await leftJoinGroupLinks(tasksWithStatusQuery(this.db, trx))
        .where((eb) => specifications.toExpr(eb))
        .orderBy('tasks.start_date', 'asc')
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
          qb
            .leftJoin('task_to_group', 'task_to_group.task_id', 'tasks.id')
            .select(['task_to_group.group_id as group_id']),
        with_group_links_inner_join: (qb: typeof query) =>
          qb
            .innerJoin('task_to_group', 'task_to_group.task_id', 'tasks.id')
            .select(['task_to_group.group_id as group_id']),
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
    group_id?: number | null;
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
      group_id: raw.group_id,
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
