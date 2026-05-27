import { GroupsToken } from '@/modules/tasks/tokens';
import { GoalStatus, GroupStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { groupBy } from 'lodash';
import { GroupInfoView } from '../../dto';
import { GoalTransaction, GroupsReadRepository, TaskDatabase } from '../../ports';
import { GoalPublicService } from '../../services';
import { GroupByStatus, GroupByUserId, groupsCombinators } from '../../specifications';
import { GetAssignableGroupsQuery } from './get-assignable-groups.query';

const { and, not } = groupsCombinators;

@QueryHandler(GetAssignableGroupsQuery)
export class GetAssignableGroupsHandler implements IQueryHandler<GetAssignableGroupsQuery> {
  constructor(
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: TaskDatabase,
    private readonly goalPublicService: GoalPublicService,
  ) {}

  execute({ input }: GetAssignableGroupsQuery): Promise<GroupInfoView[]> {
    return this.db.runTransaction(async (trx) => {
      const infoGroups = await this.groupsReadRepo.getInfoGroups(
        and(GroupByUserId(input.userId), not(GroupByStatus([GroupStatus.DONE]))),
        trx,
      );

      const t = trx as unknown as GoalTransaction;
      const statusInfo = await this.goalPublicService.getGoalInfoByChildGroups(
        {
          groupIds: infoGroups.map((i) => i.id),
          userId: input.userId,
        },
        t,
      );

      /**
       * Если группа не состоит в начатых целях
       * */
      const groupById = groupBy(statusInfo, (info) => info.groupId);
      return infoGroups.filter((group) => {
        const goalParent = groupById[group.id.toString()];
        if (goalParent == null || goalParent.length === 0) return true;
        return goalParent.every((parent) => parent.goalStatus === GoalStatus.NOT_STARTED);
      });
    });
  }
}
