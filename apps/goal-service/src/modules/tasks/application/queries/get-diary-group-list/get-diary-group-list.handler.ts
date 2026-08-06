import { GroupsToken } from '@/modules/tasks/tokens';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GroupView } from '../../dto';
import { GroupsReadRepository, TaskDatabase } from '../../ports';
import { GetDiaryGroupListQuery } from './get-diary-group-list.query';

@QueryHandler(GetDiaryGroupListQuery)
export class GetDiaryGroupListHandler implements IQueryHandler<GetDiaryGroupListQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
  ) {}

  execute({ input }: GetDiaryGroupListQuery): Promise<GroupView[]> {
    return this.db.runTransaction((trx) => this.groupsReadRepo.getDiaryGroups(input, trx));
  }
}
