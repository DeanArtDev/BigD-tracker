import { GoalsToken } from '@/modules/tasks/tokens';
import { GoalStatus } from '@big-d/api-contracts';
import { Inject, Injectable } from '@nestjs/common';
import { GoalsReadRepository, GoalTransaction } from '../ports';

@Injectable()
class GoalPublicService {
  constructor(
    @Inject(GoalsToken.READ_REPOSITORY) private readonly goalsReadRepo: GoalsReadRepository,
  ) {}

  async getGoalInfoByChildGroups(
    input: { groupIds: number[]; userId: number },
    trx?: GoalTransaction,
  ): Promise<{ groupId: number; goalId: number; goalStatus: GoalStatus }[]> {
    return await this.goalsReadRepo.getGoalInfoByChildGroups(input, trx);
  }
}

export { GoalPublicService };
