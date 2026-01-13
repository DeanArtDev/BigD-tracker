import { DB } from '@/infrastructure/types';
import { GroupInboxView, GroupView, GroupWithTasksView } from '@/modules/tasks/application/dto';
import {
  Database,
  GetGroupByIdInput,
  GroupsReadRepository,
  ThrowErrorOptions,
} from '@/modules/tasks/application/ports';
import { tasksAreInInboxSpec } from '@/modules/tasks/domain';
import { GroupStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { GroupReadKyselyMapper } from '../../mappers/groups.read-mapper';
import { TasksReadKyselyMapper } from '../../mappers/tasks.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import {
  firstOrThrowError,
  getAvailableGroupQuery,
  getGroupWithStatusQuery,
  getInboxByUserIdQuery,
  getTasksWithStatusQuery,
} from '../helpers';

@Injectable()
export class GroupsReadRepositoryKysely
  extends BaseTasksRepository
  implements GroupsReadRepository
{
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: Database<DB>) {
    super();
  }

  /**
   * Ищет во всех группах, даже в IN_BOX
   * */
  async getByName(
    input: { name: string; userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupView | null> {
    return await this.errorCatcher('groups.get-by-name', async () => {
      const result = await getGroupWithStatusQuery(this.db, trx)
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

  async getInboxWithTasksByUserId(
    input: { userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupInboxView> {
    return await this.errorCatcher('groups.get-inbox-by-user-id-with-tasks', async () => {
      const inbox = await getInboxByUserIdQuery(this.db, input, trx).executeTakeFirstOrThrow();

      const tasks = await getTasksWithStatusQuery(this.db, trx)
        .innerJoin('task_to_group as ttg', 't.id', 'ttg.task_id')
        .where('ttg.group_id', '=', inbox.id)
        .where('ts.name', 'in', tasksAreInInboxSpec.default)
        .orderBy('t.id', 'asc')
        .execute();

      return GroupReadKyselyMapper.fromRawToInboxView({
        id: inbox.id,
        name: inbox.name,
        user_id: inbox.user_id,
        tasks: tasks.map(TasksReadKyselyMapper.fromRawToView),
      });
    });
  }

  async ensureTaskInInboxGroup(
    input: { userId: number; taskId: number },
    trx?: Transaction<DB>,
  ): Promise<{ inboxId: number; success: boolean }> {
    return await this.errorCatcher('groups.is-task-in-inbox', async () => {
      const inbox = await getInboxByUserIdQuery(
        this.db,
        { userId: input.userId },
        trx,
      ).executeTakeFirstOrThrow();

      const tasks = await this.db
        .qb(trx)
        .selectFrom('task_to_group')
        .where('group_id', '=', inbox.id)
        .where('task_id', '=', input.taskId)
        .execute();

      return {
        inboxId: inbox.id,
        success: tasks.length > 0,
      };
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
}
