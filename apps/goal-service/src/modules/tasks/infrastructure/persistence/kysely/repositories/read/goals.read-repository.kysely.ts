import {
  GoalDatabase,
  GoalsReadRepository,
  GoalTransaction,
} from '@/modules/tasks/application/ports';
import { GoalStatus } from '@big-d/api-contracts';
import { databaseToken } from '@big-d/database';
import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'kysely';
import { BaseTasksRepository } from '../base-tasks.repository';

@Injectable()
export class GoalsReadRepositoryKysely extends BaseTasksRepository implements GoalsReadRepository {
  constructor(@Inject(databaseToken.CONNECTION) private readonly db: GoalDatabase) {
    super();
  }

  async getGoalInfoByChildGroups(
    input: { groupIds: number[]; userId: number },
    trx?: GoalTransaction,
  ): Promise<{ groupId: number; goalId: number; goalStatus: GoalStatus }[]> {
    return await this.errorCatcher('goals.get-goal-info-by-child-groups', async () => {
      const { groupIds, userId } = input;

      return await this.db
        .qb(trx)
        .selectFrom('groups')
        .innerJoin('group_to_goals', 'group_to_goals.group_id', 'groups.id')
        .innerJoin('goals', 'group_to_goals.goal_id', 'goals.id')
        .innerJoin('goal_statuses', 'goal_statuses.id', 'goals.status_id')
        .where('goals.user_id', '=', userId)
        .where('groups.user_id', '=', userId)
        .where('groups.id', 'in', groupIds)
        .select([
          'groups.id as groupId',
          'goals.id as goalId',
          sql<GoalStatus>`goal_statuses.name`.as('goalStatus'),
        ])
        .execute();
    });
  }
}
