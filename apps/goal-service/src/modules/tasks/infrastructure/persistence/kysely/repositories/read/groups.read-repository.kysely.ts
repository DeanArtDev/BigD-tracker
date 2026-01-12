import { DB } from '@/infrastructure/types';
import { GroupInboxView } from '@/modules/tasks/application/dto/group-inbox.view';
import { GroupView } from '@/modules/tasks/application/dto/group.view';
import { GroupsReadRepository } from '@/modules/tasks/application/ports';
import { tasksAreInInboxSpec } from '@/modules/tasks/domain';
import { Database } from '@/modules/tasks/application/ports';
import { GroupStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { GroupReadKyselyMapper } from '../../mappers/groups.read-mapper';
import { TasksReadKyselyMapper } from '../../mappers/tasks.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { getGroupWithStatusQuery } from './helpers/get-group-with-status.query';
import { getInboxByUserIdQuery } from './helpers';

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
        tasks: [],
      });
    });
  }

  async getGroupById(
    input: { groupId: number; userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupView | null> {
    return await this.errorCatcher('groups.get-by-id', async () => {
      const result = await getGroupWithStatusQuery(this.db, trx)
        .where('g.id', '=', input.groupId)
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
        tasks: [],
      });
    });
  }

  async getInboxWithTasksByUserId(
    input: { userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupInboxView> {
    return await this.errorCatcher('groups.get-inbox-by-user-id-with-tasks', async () => {
      const inbox = await getInboxByUserIdQuery(this.db, input, trx).executeTakeFirstOrThrow();

      const tasks = await this.db
        .qb(trx)
        .selectFrom('tasks as t')
        .innerJoin('task_statuses as ts', 'ts.id', 't.status_id')
        .innerJoin('task_to_group as ttg', 't.id', 'ttg.task_id')
        .select([
          't.id as id',
          't.user_id as user_id',
          't.name as name',
          't.description as description',
          't.priority as priority',
          't.weight as weight',
          't.cancel_reason as cancel_reason',
          't.start_date as start_date',
          't.end_date as end_date',
          't.deadline as deadline',
          't.recurrence as recurrence',
          'ts.name as status',
        ])
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
