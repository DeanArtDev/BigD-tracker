import { GroupInfoView, GroupView, GroupWithTasksView, TaskView } from '@/modules/tasks/application/dto';
import {
  GetGroupByIdInput,
  GroupsReadRepository,
  TaskDatabase,
  TaskTransaction,
  ThrowErrorOptions,
} from '@/modules/tasks/application/ports';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { GroupStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupReadKyselyMapper } from '../../mappers/groups.read-mapper';
import { TasksReadKyselyMapper } from '../../mappers/tasks.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { firstOrThrowError, getAvailableGroupQuery } from '../helpers';
import { groupWithStatusQuery, leftJoinTaskRecurrences, tasksWithStatusQuery } from '../utils';

@Injectable()
export class GroupsReadRepositoryKysely extends BaseTasksRepository implements GroupsReadRepository {
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase) {
    super();
  }

  async getInfoGroups(specifications: TasksSpecification, trx?: TaskTransaction): Promise<GroupInfoView[]> {
    return await this.errorCatcher('groups.get-info', async () => {
      const groups = await groupWithStatusQuery(this.db, trx)
        .where((eb) => specifications.toExpr(eb))
        .execute();

      return groups.map((group) => {
        return GroupReadKyselyMapper.fromRawToInfoView({
          id: group.id,
          name: group.name,
        });
      });
    });
  }

  async getByName(input: { name: string; userId: number }, trx?: TaskTransaction): Promise<GroupView | null> {
    return await this.errorCatcher('groups.get-by-name', async () => {
      const result = await getAvailableGroupQuery(this.db, trx)
        .where('g.name', '=', input.name)
        .where('g.user_id', '=', input.userId)
        .executeTakeFirst();
      if (result == null) return null;

      return GroupReadKyselyMapper.fromRawToView({
        id: result.id,
        name: result.name,
        description: result.description,
        user_id: result.user_id,
        progress: result.progress,
        status: result.status as GroupStatus,
      });
    });
  }

  async getGroup(specifications: TasksSpecification, trx?: TaskTransaction): Promise<GroupView | null> {
    return await this.errorCatcher('groups.get.read', async () => {
      const group = await groupWithStatusQuery(this.db, trx)
        .where((eb) => specifications.toExpr(eb))
        .executeTakeFirst();
      if (group == null) return null;

      return GroupReadKyselyMapper.fromRawToView({
        id: group.id,
        name: group.name,
        description: group.description,
        user_id: group.user_id,
        progress: group.progress,
        status: group.status,
      });
    });
  }

  getGroupWithTasksById(
    input: GetGroupByIdInput,
    options?: { throwError?: false; trx?: TaskTransaction },
  ): Promise<GroupWithTasksView | null>;
  getGroupWithTasksById(
    input: GetGroupByIdInput,
    options: { throwError: true; trx?: TaskTransaction },
  ): Promise<GroupWithTasksView>;
  async getGroupWithTasksById(
    input: GetGroupByIdInput,
    options?: ThrowErrorOptions,
  ): Promise<GroupWithTasksView | null> {
    return await this.errorCatcher('groups.get-with-tasks-by-id.read', async () => {
      const { trx, throwError } = options ?? {};

      const query = getAvailableGroupQuery(this.db, trx)
        .where('g.id', '=', input.groupId)
        .where('g.user_id', '=', input.userId);

      const group = await firstOrThrowError(query, { throwError });
      if (group == null) return null;

      const tasks = await tasksWithStatusQuery(this.db, trx)
        .where('tasks.group_id', '=', group.id)
        .orderBy('tasks.id', 'asc')
        .execute();

      return GroupReadKyselyMapper.fromRawToWithTaskView({
        id: group.id,
        name: group.name,
        description: group.description,
        user_id: group.user_id,
        progress: group.progress,
        status: group.status as GroupStatus,
        tasks: tasks.map((task) =>
          TasksReadKyselyMapper.fromRawToView({
            id: task.id,
            user_id: task.user_id,
            group_id: group.id,
            name: task.name,
            description: task.description,
            priority: task.priority,
            weight: task.weight,
            cancel_reason: task.cancel_reason,
            start_date: task.start_date,
            end_date: task.end_date,
            deadline: task.deadline,
            status: task.status,
          }),
        ),
      });
    });
  }

  async ensureTaskInGroup(
    input: { userId: number; taskId: number; groupId: number },
    trx?: TaskTransaction,
  ): Promise<boolean> {
    return await this.errorCatcher('groups.is-task-in-group', async () => {
      const { taskId, groupId, userId } = input;

      const tasks = await this.db
        .qb(trx)
        .selectFrom('tasks')
        .where('tasks.group_id', '=', groupId)
        .where('tasks.id', '=', taskId)
        .where('tasks.user_id', '=', userId)
        .execute();

      return tasks.length > 0;
    });
  }

  async getGroupListWithTasks(
    groupSpecifications: TasksSpecification,
    taskSpecifications: TasksSpecification,
    params: { limit: number },
    trx?: TaskTransaction,
  ): Promise<GroupWithTasksView[]> {
    return await this.errorCatcher('groups.get-group-list-with-tasks', async () => {
      const groupsQuery = groupWithStatusQuery(this.db, trx).where((eb) => groupSpecifications.toExpr(eb));

      const groups = await groupsQuery.limit(params.limit).orderBy('groups.id', 'asc').execute();
      if (groups.length === 0) return [];

      const response: GroupWithTasksView[] = [];

      const tasks = await leftJoinTaskRecurrences(tasksWithStatusQuery(this.db, trx))
        .innerJoin('task_to_group', 'tasks.id', 'task_to_group.task_id')
        .where((eb) => taskSpecifications.toExpr(eb))
        .where(
          'tasks.group_id',
          'in',
          groups.map((group) => group.id),
        )
        .orderBy('task_to_group.position', 'asc')
        .execute();

      const tasksByGroupIdMap = new Map<(typeof tasks)[0]['group_id'], TaskView[]>([]);

      for (const task of tasks) {
        const taskView = TasksReadKyselyMapper.fromRawToView({
          id: task.id,
          user_id: task.user_id,
          group_id: task.group_id,
          name: task.name,
          description: task.description,
          priority: task.priority,
          weight: task.weight,
          cancel_reason: task.cancel_reason,
          start_date: task.start_date,
          end_date: task.end_date,
          deadline: task.deadline,
          status: task.status,
          recurrence: {
            recurrence_status: task.recurrence_status,
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

        const arr = tasksByGroupIdMap.get(task.group_id);
        if (Array.isArray(arr)) arr.push(taskView);
        else tasksByGroupIdMap.set(task.group_id, [taskView]);
      }

      for (const group of groups) {
        response.push(
          GroupReadKyselyMapper.fromRawToWithTaskView({
            id: group.id,
            name: group.name,
            description: group.description,
            user_id: group.user_id,
            progress: group.progress,
            status: group.status,
            tasks: tasksByGroupIdMap.get(group.id) ?? [],
          }),
        );
      }

      return response;
    });
  }
}
