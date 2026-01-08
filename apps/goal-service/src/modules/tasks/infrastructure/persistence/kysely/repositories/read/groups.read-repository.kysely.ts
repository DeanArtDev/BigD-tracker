import { DB } from '@/infrastructure/types';
import { GroupInboxView } from '@/modules/tasks/application/dto/group-inbox.view';
import { GroupView } from '@/modules/tasks/application/dto/group.view';
import { GroupsReadRepository } from '@/modules/tasks/application/ports';
import { tasksAreInInboxSpec } from '@/modules/tasks/domain';
import { Database } from '@/modules/tasks/infrastructure/database.interface';
import { getInboxByUserId } from './helpers/get-inbox-by-user-id';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { GroupReadKyselyMapper } from '../../mappers/groups.read-mapper';
import { TasksReadKyselyMapper } from '../../mappers/tasks.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { isGroupExists } from './helpers';

@Injectable()
export class GroupsReadRepositoryKysely
  extends BaseTasksRepository
  implements GroupsReadRepository
{
  #tableName = 'groups' as const;

  constructor(@Inject(databaseToken.CONNECTION) private readonly db: Database<DB>) {
    super();
  }

  async getByName(
    input: { name: string; userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupView | null> {
    return await this.errorCatcher('groups.get-by-name', async () => {
      const result = await this.db
        .qb(trx)
        .selectFrom(this.#tableName)
        .where('name', '=', input.name)
        .where('user_id', '=', input.userId)
        .select(['id', 'user_id', 'description', 'name', 'status_id', 'progress'])
        .executeTakeFirst();
      if (result == null) return null;

      const status = await this.db
        .qb(trx)
        .selectFrom('group_statuses')
        .where('id', '=', result.status_id)
        .select(['name'])
        .executeTakeFirst();
      if (status == null) return null;

      return GroupReadKyselyMapper.fromRawToView({
        id: result.id,
        name: result.name,
        description: result.description,
        user_id: result.user_id,
        progress: result.progress,
        status: status.name,
      });
    });
  }

  async getInboxWithTasksByUserId(
    input: { userId: number },
    trx?: Transaction<DB>,
  ): Promise<GroupInboxView | null> {
    return await this.errorCatcher('groups.get-inbox-by-user-id-with-tasks', async () => {
      const inbox = await getInboxByUserId(this.db, input, trx);
      if (inbox == null) return null;

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

  async isGroupExists(
    input: { groupId: number } | { name: string },
    trx?: Transaction<DB>,
  ): Promise<boolean> {
    return await this.errorCatcher('groups.is-group-exists', async () => {
      return isGroupExists(this.db, input, trx);
    });
  }

  async ensureTaskInInboxGroup(
    input: { userId: number; taskId: number },
    trx?: Transaction<DB>,
  ): Promise<{ success: false } | { success: true; inboxId: number }> {
    return await this.errorCatcher('groups.is-task-in-group', async () => {
      const inbox = await getInboxByUserId(this.db, { userId: input.userId }, trx);
      if (inbox == null) return { success: false };

      const tasks = await this.db
        .qb(trx)
        .selectFrom('task_to_group')
        .where('group_id', '=', inbox.id)
        .where('task_id', '=', input.taskId)
        .execute();

      return tasks.length > 0
        ? {
            success: true,
            inboxId: inbox.id,
          }
        : { success: false };
    });
  }
}
