import { DB } from '@/infrastructure/types';
import { GroupsToken } from '@/modules/tasks/tokens';
import { GoalStatus, GroupStatus } from '@big-d/api-contracts';
import { databaseToken, IKyselyPostgresDB } from '@big-d/database';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { keyBy } from 'lodash';
import { GroupInfoView } from '../../dto';
import { GoalTransaction, GroupsReadRepository, TaskTransaction } from '../../ports';
import { GoalPublicService } from '../../services';
import { GroupByStatus, GroupByUserId, GroupInbox, groupsCombinators } from '../../specifications';
import { GetAssignableGroupsQuery } from './get-assignable-groups.query';

const { and, not } = groupsCombinators;
/** TODO:FIXME:
 * [] группа юзера
 * [] группа не завершена
 * [] группа не в составе начатой цели ( унести эту проверку в GOAL BC )
 * []
 * */
@QueryHandler(GetAssignableGroupsQuery)
export class GetAssignableGroupsHandler implements IQueryHandler<GetAssignableGroupsQuery> {
  constructor(
    @Inject(GroupsToken.READ_REPOSITORY) private readonly groupsReadRepo: GroupsReadRepository,
    @Inject(databaseToken.CONNECTION) private readonly db: IKyselyPostgresDB<DB>,
    private readonly goalPublicService: GoalPublicService,
  ) {}

  async execute({ input }: GetAssignableGroupsQuery): Promise<GroupInfoView[]> {
    return this.db.runTransaction(async (trx) => {
      const infoGroups = await this.groupsReadRepo.getInfoGroups(
        and(GroupByUserId(input.userId), not(GroupInbox()), not(GroupByStatus([GroupStatus.DONE]))),
        trx as unknown as TaskTransaction,
      );

      const statusInfo = await this.goalPublicService.getGoalInfoByChildGroups(
        {
          groupIds: infoGroups.map((i) => i.id),
          userId: input.userId,
        },
        trx as unknown as GoalTransaction,
      );

      const byId = keyBy(statusInfo, 'groupId');

      /**
       * Если группа не состоит в начатых целях
       * */
      return infoGroups.filter((group) => {
        const goalParent = byId[group.id];
        if (goalParent == null) return true;
        return goalParent.goalStatus === GoalStatus.NOT_STARTED;
      });
    });
  }
}
