import { TaskView } from '@/modules/tasks/application/dto';
import {
  TaskDatabase,
  TasksReadRepository,
  TasksShapeTypes,
  TasksSorting,
  TaskTransaction,
} from '@/modules/tasks/application/ports';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { RecurrenceFrequency, SortDirection, TaskRecurrenceWeekday, TaskStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { toLower } from 'lodash';
import { TasksReadKyselyMapper } from '../../mappers/tasks.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { leftJoinGroupLinks, leftJoinTaskRecurrences, taskFullSelect, tasksWithStatusQuery } from '../utils';

@Injectable()
export class TasksReadRepositoryKysely extends BaseTasksRepository implements TasksReadRepository {
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase) {
    super();
  }

  async getById(input: { userId: number; id: number }, trx?: TaskTransaction): Promise<TaskView | null> {
    return await this.errorCatcher('tasks.get-by-id', async () => {
      const { id, userId } = input;

      const task = await leftJoinTaskRecurrences(leftJoinGroupLinks(tasksWithStatusQuery(this.db, trx)))
        .where('tasks.id', '=', id)
        .where('tasks.user_id', '=', userId)
        .executeTakeFirst();

      if (task == null) return null;

      return this.#map({
        ...task,
        recurrence: {
          timezone: task.recurrence_timezone,
          recurrence_frequency: task.recurrence_frequency,
          start_date: task.start_date,
          interval: task.recurrence_interval,
          weekdays: task.recurrence_weekdays,
          monthdays: task.recurrence_monthdays,
          yearmonths: task.recurrence_yearmonths,
          until_date: task.recurrence_until_date,
        },
      });
    });
  }

  async isTaskIntoGroup(input: { taskId: number; groupId: number }, trx?: TaskTransaction): Promise<boolean> {
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

  async getByRange(
    specifications: TasksSpecification,
    params: { page: number; perPage: number },
    sort?: TasksSorting,
    trx?: TaskTransaction,
  ): Promise<TaskView[]> {
    return await this.errorCatcher('tasks.get-by-range.read', async () => {
      const { page, perPage } = params;

      const tasks = await leftJoinTaskRecurrences(leftJoinGroupLinks(tasksWithStatusQuery(this.db, trx)))
        .distinct()
        .where((eb) => specifications.toExpr(eb))
        .$if(sort == null, (qb) => qb.orderBy('tasks.id', 'asc'))
        .$if(sort?.priority != null, (qb) => qb.orderBy('tasks.priority', toLower(sort!.priority)))
        .$if(sort?.deadline != null, (qb) =>
          qb.orderBy('tasks.deadline', (ob) => {
            if (sort!.deadline === SortDirection.ASC) {
              return ob.asc().nullsLast();
            }

            if (sort!.deadline === SortDirection.DESC) {
              return ob.desc().nullsFirst();
            }

            return ob;
          }),
        )
        .$if(sort?.startDate != null, (qb) =>
          qb.orderBy('tasks.start_date', (ob) => {
            if (sort!.startDate === SortDirection.ASC) {
              return ob.asc().nullsLast();
            }

            if (sort!.startDate === SortDirection.DESC) {
              return ob.desc().nullsFirst();
            }

            return ob;
          }),
        )
        .limit(params.perPage)
        .$if(page > 1, (qb) => qb.offset((page - 1) * perPage))
        .execute();

      return tasks.map((task) => {
        return this.#map({
          ...task,
          recurrence: {
            timezone: task.recurrence_timezone,
            recurrence_frequency: task.recurrence_frequency,
            start_date: task.start_date,
            interval: task.recurrence_interval,
            weekdays: task.recurrence_weekdays,
            monthdays: task.recurrence_monthdays,
            yearmonths: task.recurrence_yearmonths,
            until_date: task.recurrence_until_date,
          },
        });
      });
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

      const tasks = await leftJoinTaskRecurrences(taskFullSelect(query))
        .where((eb) => specifications.toExpr(eb))
        .orderBy('id', 'asc')
        .execute();

      return tasks.map((task) => {
        return this.#map({
          ...task,
          recurrence: {
            timezone: task.recurrence_timezone,
            recurrence_frequency: task.recurrence_frequency,
            start_date: task.start_date,
            interval: task.recurrence_interval,
            weekdays: task.recurrence_weekdays,
            monthdays: task.recurrence_monthdays,
            yearmonths: task.recurrence_yearmonths,
            until_date: task.recurrence_until_date,
          },
        });
      });
    });
  }

  #map = (raw: {
    readonly status: string;
    readonly id: number;
    readonly user_id: number;
    readonly group_id?: number | null;
    readonly name: string;
    readonly description: string | null;
    readonly priority: number;
    readonly weight: number;
    readonly cancel_reason: string | null;
    readonly start_date: Date | null;
    readonly end_date: Date | null;
    readonly deadline: Date | null;
    readonly recurrence: {
      readonly timezone?: string | null;
      readonly recurrence_frequency?: keyof typeof RecurrenceFrequency | null;
      readonly start_date?: Date | null;
      readonly interval?: number | null;
      readonly weekdays?: TaskRecurrenceWeekday[] | null;
      readonly monthdays?: number[] | null;
      readonly yearmonths?: number[] | null;
      readonly until_date?: Date | null;
    };
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
      status: raw.status as TaskStatus,
      recurrence: raw.recurrence,
    });
  };
}
