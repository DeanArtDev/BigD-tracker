import { GroupsWriteRepository, TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { groupsQuerySpec, Task } from '@/modules/tasks/domain';
import { Group } from '@/modules/tasks/domain/aggregates/group';
import { GroupStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupWriteKyselyMapper } from '../../mappers/groups.write-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { groupWithStatusQuery } from '../utils';

@Injectable()
export class GroupWriteRepositoryKysely extends BaseTasksRepository implements GroupsWriteRepository {
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase) {
    super();
  }

  async getGroup(specifications: TasksSpecification, trx?: TaskTransaction): Promise<Group | null> {
    return await this.errorCatcher('groups.get.read', async () => {
      const group = await groupWithStatusQuery(this.db, trx)
        .where((eb) => specifications.toExpr(eb))
        .executeTakeFirst();
      if (group == null) return null;

      return GroupWriteKyselyMapper.fromRawToAgr({
        id: group.id,
        name: group.name,
        description: group.description,
        user_id: group.user_id,
        progress: group.progress,
        status: group.status,
      });
    });
  }

  async createGroup(group: Group, trx?: TaskTransaction): Promise<Group> {
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
   * Обновление группы и порядка ее дел
   * taskIds === [] удалит все дела из группы
   * taskIds === undefined не будет изменять текущее значение
   * */
  async updateGroupAndTaskOrder(input: { group: Group; taskIds?: Task['id'][] }, trx?: TaskTransaction): Promise<void> {
    return await this.errorCatcher('groups.update-group-and-task-order', async () => {
      const { group, taskIds } = input;

      await this.db
        .qb(trx)
        .updateTable('groups')
        .where('id', '=', group.id)
        .where('user_id', '=', group.userId)
        .where('name', 'not in', groupsQuerySpec.unavailableNames)
        .set({
          name: group.name,
          description: group.description,
        })
        .executeTakeFirstOrThrow();

      if (taskIds !== undefined) {
        const qb = this.db.qb(trx);

        await qb.deleteFrom('task_to_group').where('group_id', '=', group.id).execute();

        if (taskIds.length > 0) {
          await qb
            .insertInto('task_to_group')
            .values(
              taskIds.map((taskId, position) => ({
                task_id: taskId,
                group_id: group.id,
                position,
              })),
            )
            .executeTakeFirstOrThrow();
        }

        await qb
          .updateTable('tasks')
          .set({ group_id: null })
          .where('group_id', '=', group.id)
          .where('user_id', '=', group.userId)
          .execute();

        if (taskIds.length > 0) {
          await qb
            .updateTable('tasks')
            .set({ group_id: group.id })
            .where('id', 'in', taskIds)
            .where('user_id', '=', group.userId)
            .execute();
        }
      }
    });
  }

  async delete(specification: TasksSpecification, trx?: TaskTransaction): Promise<boolean> {
    return await this.errorCatcher('groups.delete.write', async () => {
      const result = await this.db
        .qb(trx)
        .deleteFrom('groups')
        .where((eb) => specification.toExpr(eb))
        .executeTakeFirst();

      return result.numDeletedRows > 0;
    });
  }
}
