import { GoalTransaction } from '../transaction-manager.port';
import { GoalStatus } from '@big-d/api-contracts';

interface GoalsReadRepository {
  getGoalInfoByChildGroups(
    input: { groupIds: number[]; userId: number },
    trx?: GoalTransaction,
  ): Promise<{ groupId: number; goalId: number; goalStatus: GoalStatus }[]>;
}

export { GoalsReadRepository };
