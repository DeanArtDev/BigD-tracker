import { DB } from '@/infrastructure/types';
import { GroupView, GroupWithTasksView, TaskView } from '@/modules/tasks/application/dto';
import {
  Database,
  GetGroupByIdInput,
  GroupsReadRepository,
  ThrowErrorOptions,
} from '@/modules/tasks/application/ports';
import { groupsQuerySpec } from '@/modules/tasks/domain';
import { GroupStatus, TaskStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { GroupReadKyselyMapper } from '../../mappers/groups.read-mapper';
import { TasksReadKyselyMapper } from '../../mappers/tasks.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { firstOrThrowError, getAvailableGroupQuery, getTasksWithStatusQuery } from '../helpers';

@Injectable()
export class GroupsReadRepositoryKysely
  extends BaseTasksRepository
  implements GroupsReadRepository
{
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: Database<DB>) {
    super();
  }

  async getByName(
    input: { name: string; userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupView | null> {
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

  getGroupById(
    input: GetGroupByIdInput,
    options?: { throwError?: false; trx?: Transaction<DB> },
  ): Promise<GroupView | null>;
  getGroupById(
    input: GetGroupByIdInput,
    options: { throwError: true; trx?: Transaction<DB> },
  ): Promise<GroupView>;
  async getGroupById(
    input: GetGroupByIdInput,
    options?: ThrowErrorOptions,
  ): Promise<GroupView | null> {
    return await this.errorCatcher('groups.get-by-id.read', async () => {
      const { trx, throwError } = options ?? {};

      const query = getAvailableGroupQuery(this.db, trx)
        .where('g.id', '=', input.groupId)
        .where('g.user_id', '=', input.userId);

      const result = await firstOrThrowError(query, { throwError });
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

  getGroupWithTasksById(
    input: GetGroupByIdInput,
    options?: { throwError?: false; trx?: Transaction<DB> },
  ): Promise<GroupWithTasksView | null>;
  getGroupWithTasksById(
    input: GetGroupByIdInput,
    options: { throwError: true; trx?: Transaction<DB> },
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

      const result = await firstOrThrowError(query, { throwError });
      if (result == null) return null;

      const tasks = await getTasksWithStatusQuery(this.db, trx)
        .innerJoin('task_to_group as ttg', 't.id', 'ttg.task_id')
        .where('ttg.group_id', '=', input.groupId)
        .orderBy('ttg.position', 'asc')
        .execute();

      return GroupReadKyselyMapper.fromRawToWithTaskView({
        id: result.id,
        name: result.name,
        description: result.description,
        user_id: result.user_id,
        progress: result.progress,
        status: result.status as GroupStatus,
        tasks: tasks.map(TasksReadKyselyMapper.fromRawToView),
      });
    });
  }

  async ensureTaskInGroup(
    input: { userId: number; taskId: number; groupId: number },
    trx?: Transaction<DB>,
  ): Promise<boolean> {
    return await this.errorCatcher('groups.is-task-in-group', async () => {
      const { taskId, groupId, userId } = input;

      const tasks = await this.db
        .qb(trx)
        .selectFrom('task_to_group as ttg')
        .innerJoin('groups as g', 'g.id', 'ttg.group_id')
        .where('ttg.group_id', '=', groupId)
        .where('ttg.task_id', '=', taskId)
        .where('g.user_id', '=', userId)
        .execute();

      return tasks.length > 0;
    });
  }

  async getGroupListWithTasksByUserId(
    input: { userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupWithTasksView[]> {
    return await this.errorCatcher('groups.get-group-list-with-tasks-by-user-id', async () => {
      const { userId } = input;

      const groups = await getAvailableGroupQuery(this.db, trx)
        .where('g.user_id', '=', userId)
        .where('gs.name', 'not in', groupsQuerySpec.unavailableStatuses)
        .execute();
      if (groups.length === 0) return [];

      const response: GroupWithTasksView[] = [];

      const tasks = await getTasksWithStatusQuery(this.db, trx)
        .innerJoin('task_to_group as ttg', 't.id', 'ttg.task_id')
        .where('t.user_id', '=', userId)
        .where(
          'ttg.group_id',
          'in',
          groups.map((group) => group.id),
        )
        .select(['ttg.group_id as group_id'])
        .orderBy('ttg.position', 'asc')
        .execute();

      const tasksByGroupIdMap = new Map<(typeof tasks)[0]['group_id'], TaskView[]>([]);

      for (const task of tasks) {
        const taskView = TasksReadKyselyMapper.fromRawToView({
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

        const arr = tasksByGroupIdMap.get(task.group_id);
        if (Array.isArray(arr)) arr.push(taskView);
        else tasksByGroupIdMap.set(task.group_id, [taskView]);
      }

      console.log(444, tasksByGroupIdMap);

      for (const group of groups) {
        response.push(
          GroupReadKyselyMapper.fromRawToWithTaskView({
            id: group.id,
            name: group.name,
            description: group.description,
            user_id: group.user_id,
            progress: group.progress,
            status: group.status as GroupStatus,
            tasks: tasksByGroupIdMap.get(group.id) ?? [],
          }),
        );
      }

      return response;
    });
  }
}
