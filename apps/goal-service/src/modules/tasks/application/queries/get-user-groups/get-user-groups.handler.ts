import { GroupWithTasksView } from '@/modules/tasks/application/dto';
import {
  GroupAfterId,
  GroupBySearch,
  GroupByUserId,
  GroupInbox,
  groupsCombinators,
  TaskByStatus,
  TaskByUserId,
  tasksCombinators,
} from '@/modules/tasks/application/specifications';
import { tasksQuerySpec } from '@/modules/tasks/domain';
import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { compact } from 'lodash';
import { GroupsReadRepository, TaskDatabase } from '../../ports';
import { GetUserGroupsQuery } from './get-user-groups.query';

@QueryHandler(GetUserGroupsQuery)
export class GetUserGroupsHandler implements IQueryHandler<GetUserGroupsQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
  ) {}

  async execute({ input, meta }: GetUserGroupsQuery): Promise<GroupWithTasksView[]> {
    return this.db.runTransaction(async (trx) => {
      return await this.groupsReadRepo.getGroupListWithTasks(
        groupsCombinators.and(
          ...compact([
            GroupByUserId(input.userId),
            meta?.search && GroupBySearch(meta.search),
            meta?.lastId && GroupAfterId(meta.lastId),
            groupsCombinators.not(GroupInbox()),
          ]),
        ),

        tasksCombinators.and(TaskByUserId(input.userId), TaskByStatus(tasksQuerySpec.readableStatuses)),
        { limit: meta.limit },
        trx,
      );
    });
  }
}
