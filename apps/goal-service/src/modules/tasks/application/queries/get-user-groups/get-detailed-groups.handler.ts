import { GroupDetailedView } from '@/modules/tasks/application/dto';
import { ExceptionGroupNotFound } from '@/modules/tasks/application/exceptions';
import {
  GroupById,
  GroupByUserId,
  GroupInbox,
  groupsCombinators,
  TaskByStatus,
  tasksCombinators,
} from '@/modules/tasks/application/specifications';
import { tasksQuerySpec } from '@/modules/tasks/domain';
import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupsReadRepository, TaskDatabase } from '../../ports';
import { GetDetailedGroupsQuery } from './get-detailed-groups.query';

@QueryHandler(GetDetailedGroupsQuery)
export class GetDetailedGroupsHandler implements IQueryHandler<GetDetailedGroupsQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
  ) {}

  async execute({ input }: GetDetailedGroupsQuery): Promise<GroupDetailedView> {
    return this.db.runTransaction(async (trx) => {
      const detailedGroup = await this.groupsReadRepo.getGroupDetailed(
        groupsCombinators.and(
          GroupById(input.groupId),
          GroupByUserId(input.userId),
          groupsCombinators.not(GroupInbox()),
        ),

        tasksCombinators.and(TaskByStatus(tasksQuerySpec.readableStatuses)),

        trx,
      );

      if (detailedGroup == null) {
        throw new ExceptionGroupNotFound({ groupId: input.groupId });
      }

      return detailedGroup;
    });
  }
}
