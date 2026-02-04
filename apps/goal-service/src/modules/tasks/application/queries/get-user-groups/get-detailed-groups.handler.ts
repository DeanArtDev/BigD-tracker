import { GroupDetailedView } from '@/modules/tasks/application/dto';
import { ExceptionGroupNotFound } from '@/modules/tasks/application/exceptions';
import {
  GroupById,
  GroupByUserId,
  GroupInbox,
  groupsCombinators,
} from '@/modules/tasks/application/specifications';
import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TaskDatabase, GroupsReadRepository } from '../../ports';
import { GetDetailedGroupsQuery } from './get-detailed-groups.query';

const { and, not } = groupsCombinators;

@QueryHandler(GetDetailedGroupsQuery)
export class GetDetailedGroupsHandler implements IQueryHandler<GetDetailedGroupsQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
  ) {}

  async execute({ input }: GetDetailedGroupsQuery): Promise<GroupDetailedView> {
    return this.db.runTransaction(async (trx) => {
      const detailedGroup = await this.groupsReadRepo.getGroupDetailed(
        and(GroupById(input.groupId), GroupByUserId(input.userId), not(GroupInbox())),
        trx,
      );

      if (detailedGroup == null) {
        throw new ExceptionGroupNotFound({ groupId: input.groupId });
      }

      return detailedGroup;
    });
  }
}
