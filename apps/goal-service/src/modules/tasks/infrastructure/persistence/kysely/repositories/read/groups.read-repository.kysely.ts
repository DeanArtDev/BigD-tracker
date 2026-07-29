import { GroupInfoView, GroupView } from '@/modules/tasks/application/dto';
import { GroupsReadRepository, TaskDatabase, TaskTransaction } from '@/modules/tasks/application/ports';
import { TasksSpecification } from '@/modules/tasks/application/specifications';
import { groupsQuerySpec } from '@/modules/tasks/domain';
import { GroupStatus, SortDirection } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { GroupReadKyselyMapper } from '../../mappers/groups.read-mapper';
import { BaseTasksRepository } from '../base-tasks.repository';
import { getAvailableGroupQuery } from '../helpers';
import { groupWithStatusQuery } from '../utils';

@Injectable()
export class GroupsReadRepositoryKysely extends BaseTasksRepository implements GroupsReadRepository {
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase) {
    super();
  }

  async getInfoGroups(specifications: TasksSpecification, trx?: TaskTransaction): Promise<GroupInfoView[]> {
    return await this.errorCatcher('groups.get-info', async () => {
      const groups = await groupWithStatusQuery(this.db, trx)
        .where((eb) => specifications.toExpr(eb))
        .orderBy((eb) => eb.case().when('groups.name', '=', groupsQuerySpec.inboxName).then(0).else(1).end())
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

  async getOne(specifications: TasksSpecification, trx?: TaskTransaction): Promise<GroupView | null> {
    return await this.errorCatcher('groups.get-one.read', async () => {
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

  async getGroupInfo(
    input: { groupId: number; userId: number },
    trx?: TaskTransaction,
  ): Promise<{ taskCount: number }> {
    return await this.errorCatcher('groups.get-info.read', async () => {
      const result = await this.db
        .qb(trx)
        .selectFrom('tasks')
        .select((eb) => eb.fn.count<number>('tasks.id').as('taskCount'))
        .where('tasks.group_id', '=', input.groupId)
        .where('tasks.user_id', '=', input.userId)
        .executeTakeFirstOrThrow();

      return { taskCount: Number(result.taskCount) };
    });
  }

  async getMany(
    specifications: TasksSpecification,
    params: { sort?: { name?: SortDirection; id?: SortDirection }; limit: number },
    trx?: TaskTransaction,
  ): Promise<GroupView[]> {
    return await this.errorCatcher('groups.get-many.read', async () => {
      const { sort } = params;
      const groups = await groupWithStatusQuery(this.db, trx)
        .where((eb) => specifications.toExpr(eb))
        .$if(params.sort?.id != null, (qb) => {
          return qb.orderBy('id', (ob) => {
            if (sort?.id === SortDirection.DESC) return ob.desc();
            return ob.asc();
          });
        })
        .$if(params.sort?.name != null, (qb) => {
          return qb.orderBy('name', (ob) => {
            if (sort?.name === SortDirection.DESC) return ob.desc();
            return ob.asc();
          });
        })
        .limit(params.limit)
        .execute();

      return groups.map((group) =>
        GroupReadKyselyMapper.fromRawToView({
          id: group.id,
          name: group.name,
          description: group.description,
          user_id: group.user_id,
          progress: group.progress,
          status: group.status,
        }),
      );
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
}
