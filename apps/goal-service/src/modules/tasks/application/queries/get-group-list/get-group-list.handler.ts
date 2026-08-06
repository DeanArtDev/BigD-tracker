import { GroupsToken } from '@/modules/tasks/tokens';
import { SortDirection } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { compact } from 'lodash';
import { GroupView } from '../../dto';
import { GroupsReadRepository, TaskDatabase } from '../../ports';
import {
  GroupBeforeId,
  GroupByIds,
  GroupByNameSearch,
  GroupByUserId,
  GroupInbox,
  groupsCombinators,
} from '../../specifications';
import { GetGroupListQuery } from './get-group-list.query';

const { and, not } = groupsCombinators;

@QueryHandler(GetGroupListQuery)
export class GetGroupListHandler implements IQueryHandler<GetGroupListQuery> {
  constructor(
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
  ) {}

  async execute({ input }: GetGroupListQuery): Promise<GroupView[]> {
    return this.db.runTransaction(async (trx) => {
      const { userId, ids = [], search, lastId, limit } = input;

      return await this.groupsReadRepo.getMany(
        and(
          ...compact([
            GroupByUserId(userId),
            ids.length > 0 && GroupByIds(ids),
            search != null && search.trim() !== '' && GroupByNameSearch(search),
            lastId != null && Number.isFinite(lastId) && GroupBeforeId(lastId),
            not(GroupInbox()),
          ]),
        ),
        { sort: { id: SortDirection.DESC }, limit },
        trx,
      );
    });
  }
}
