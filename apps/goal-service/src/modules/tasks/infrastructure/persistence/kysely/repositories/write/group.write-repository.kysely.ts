import { DB } from '@/infrastructure/types';
import { Database, GroupsWriteRepository } from '@/modules/tasks/application/ports';
import { Group, GroupWithTasks } from '@/modules/tasks/domain/aggregates/group';
import { GroupStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { Transaction } from 'kysely';
import { GroupWriteKyselyMapper } from '../../mappers/groups.write-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { getGroupWithStatusQuery } from '../helpers';

@Injectable()
export class GroupWriteRepositoryKysely
  extends BaseTasksRepository
  implements GroupsWriteRepository
{
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: Database<DB>) {
    super();
  }

  async getGroupById(
    input: { groupId: number; userId: number },
    trx?: Transaction<DB>,
  ): Promise<Group | null> {
    return await this.errorCatcher('groups.get-by-id.write', async () => {
      const result = await getGroupWithStatusQuery(this.db, trx)
        .where('g.id', '=', input.groupId)
        .where('g.user_id', '=', input.userId)
        .executeTakeFirst();
      if (result == null) return null;

      return GroupWriteKyselyMapper.fromRawToAgr({
        id: result.id,
        name: result.name,
        description: result.description,
        user_id: result.user_id,
        progress: result.progress,
        status: result.status as GroupStatus,
      });
    });
  }

  async createGroup(group: Group, trx?: Transaction<DB>): Promise<Group> {
    return await this.errorCatcher('groups.creation', async () => {
      const groupStatus = await this.db
        .qb(trx)
        .selectFrom('group_statuses')
        .where('name', '=', GroupStatus.NOT_STARTED)
        .select(['id', 'name'])
        .executeTakeFirstOrThrow();

      const result = await this.db
        .qb(trx)
        .insertInto('groups')
        .values({
          name: group.name,
          user_id: group.userId,
          description: group.description,
          status_id: groupStatus.id,
        })
        .returning(['id', 'name', 'user_id', 'progress', 'description'])
        .executeTakeFirstOrThrow();

      return GroupWriteKyselyMapper.fromRawToAgr({
        id: result.id,
        name: result.name,
        user_id: result.user_id,
        status: groupStatus.name as GroupStatus,
        progress: result.progress,
        description: result.description,
      });
    });
  }

  /**
   * Обновление группы с ее делами
   * */
  async replaceGroupWithTasks(group: GroupWithTasks, trx?: Transaction<DB>): Promise<void> {
    return await this.errorCatcher('groups.replace-with-tasks', async () => {
      await this.db
        .qb(trx)
        .updateTable('groups')
        .where('id', '=', group.id)
        .where('user_id', '=', group.userId)
        .set({
          name: group.name,
          description: group.description,
        })
        .executeTakeFirstOrThrow();

      await this.db
        .qb(trx)
        .deleteFrom('task_to_group as ttg')
        .where('ttg.group_id', '=', group.id)
        .execute();

      for (let i = 0; i < group.tasks.length; i++) {
        const task = group.tasks[i];

        await this.db
          .qb(trx)
          .updateTable('tasks')
          .where('id', '=', task.id)
          .where('user_id', '=', group.userId)
          .set({
            name: task.name,
            description: task.description,
            priority: task.priority,
            start_date: task.startDate,
            deadline: task.deadline,
            weight: task.weight,
            recurrence: task.recurrence,
          })
          .executeTakeFirstOrThrow();
      }

      if (group.tasks.length > 0) {
        await this.db
          .qb(trx)
          .insertInto('task_to_group')
          .values(
            group.tasks.map((t, i) => ({
              task_id: t.id,
              group_id: group.id,
              position: i,
            })),
          )
          .executeTakeFirstOrThrow();
      }
    });
  }
}
