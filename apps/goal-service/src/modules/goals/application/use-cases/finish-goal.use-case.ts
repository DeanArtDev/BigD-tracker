import { GOALS_REPOSITORY, GoalsRepository } from '@/modules/goals/application';
import { GoalEntity } from '@/modules/goals/domain';
import { DateVo, ReturnHandlerType } from '@big-d/api-utils';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetGoalByIdHandler, GetGoalByIdQuery } from '../queries';

interface FinishGoalInput {
  readonly id: number;
  readonly userId: number;
  readonly endDate: string;
}

@Injectable()
export class FinishGoalUseCase {
  constructor(
    @Inject(GOALS_REPOSITORY) private readonly goalsRepo: GoalsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({ id, userId, endDate }: FinishGoalInput): Promise<GoalEntity> {
    const goal = await this.queryBus.execute<
      GetGoalByIdQuery,
      ReturnHandlerType<typeof GetGoalByIdHandler>
    >(new GetGoalByIdQuery({ id, userId }));
    if (goal == null) {
      throw new NotFoundException(`Goal: ${id} is not existed`);
    }

    goal.finish({ endDate: DateVo.create(endDate) }).validate();

    const updated = await this.goalsRepo.update(goal);
    if (updated == null) {
      throw new InternalServerErrorException('Error occurred while finishing goal');
    }

    return updated;
  }
}
