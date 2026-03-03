import {
  GroupsWriteRepository,
  TaskDatabase,
  TaskTransaction,
} from '@/modules/tasks/application/ports';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { groupsQuerySpec } from '@/modules/tasks/domain';
import { Group, GroupWithTasks } from '@/modules/tasks/domain/aggregates/group';
import { GroupStatus, TaskStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupWriteKyselyMapper } from '../../mappers/groups.write-mapper';
import { TasksReadKyselyMapper } from '../../mappers/tasks.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { getTasksWithStatusQuery } from '../helpers';
import { groupWithStatusQuery } from '../utils';

@Injectable()
export class GroupWriteRepositoryKysely
  extends BaseTasksRepository
  implements GroupsWriteRepository
{
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase) {
    super();
  }

  async getGroupById(
    input: { groupId: number; userId: number; includeInbox?: boolean },
    trx?: TaskTransaction,
  ): Promise<GroupWithTasks | null> {
    return await this.errorCatcher('groups.get-by-id.write', async () => {
      const { includeInbox = false } = input;

      let query = groupWithStatusQuery(this.db, trx);

      if (!includeInbox) {
        query = query.where('groups.name', 'not in', groupsQuerySpec.unavailableNames);
      }

      const group = await query
        .where('groups.id', '=', input.groupId)
        .where('groups.user_id', '=', input.userId)
        .executeTakeFirst();
      if (group == null) return null;

      const tasks = await getTasksWithStatusQuery(this.db, trx)
        .innerJoin('task_to_group', 'task_to_group.task_id', 't.id')
        .select(['task_to_group.group_id as group_id'])
        .where('task_to_group.group_id', '=', input.groupId)
        .orderBy('task_to_group.position', 'asc')
        .execute();

      return GroupWriteKyselyMapper.fromRawToAgrWithTasks({
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
            recurrence: task.recurrence,
            status: task.status as TaskStatus,
          }),
        ),
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
   * Обновление группы с ее делами
   * */
  async replaceGroupWithTasks(group: GroupWithTasks, trx?: TaskTransaction): Promise<void> {
    return await this.errorCatcher('groups.replace-with-tasks', async () => {
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
