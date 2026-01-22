import { GroupWithTasksView } from '@/modules/tasks/application/dto';
import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Database, GroupsReadRepository } from '../../ports';
import { GetUserGroupsQuery } from './get-user-groups.query';

@QueryHandler(GetUserGroupsQuery)
export class GetUserGroupsHandler implements IQueryHandler<GetUserGroupsQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: Database,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
  ) {}

  async execute({ input }: GetUserGroupsQuery): Promise<GroupWithTasksView[]> {
    return this.db.runTransaction(async (trx) => {
      return await this.groupsReadRepo.getGroupListWithTasksByUserId({ userId: input.userId }, trx);
    });
  }
}
