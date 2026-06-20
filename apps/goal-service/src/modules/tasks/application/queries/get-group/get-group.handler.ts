import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupView } from '../../dto';
import { ExceptionGroupNotFound } from '../../exceptions';
import { GroupsReadRepository, TaskDatabase } from '../../ports';
import { GroupById, GroupByUserId, GroupInbox, groupsCombinators } from '../../specifications';
import { GetGroupQuery } from './get-group.query';

@QueryHandler(GetGroupQuery)
export class GetGroupHandler implements IQueryHandler<GetGroupQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
  ) {}

  async execute({ input }: GetGroupQuery): Promise<GroupView> {
    return this.db.runTransaction(async (trx) => {
      const group = await this.groupsReadRepo.getGroup(
        groupsCombinators.and(
          GroupById(input.groupId),
          GroupByUserId(input.userId),
          groupsCombinators.not(GroupInbox()),
        ),
        trx,
      );

      if (group == null) {
        throw new ExceptionGroupNotFound({ groupId: input.groupId });
      }

      return group;
    });
  }
}
