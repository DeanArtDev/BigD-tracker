import { GroupsToken } from '@/modules/tasks/tokens';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupsReadRepository } from '../../ports';
import { GetGroupInfoQuery } from './get-group-info.query';

@QueryHandler(GetGroupInfoQuery)
export class GetGroupInfoHandler implements IQueryHandler<GetGroupInfoQuery> {
  constructor(@Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository) {}

  execute({ input }: GetGroupInfoQuery): Promise<{ taskCount: number }> {
    return this.groupsReadRepo.getGroupInfo(input);
  }
}
