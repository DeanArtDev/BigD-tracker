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

interface StartGoalInput {
  readonly id: number;
  readonly userId: number;
  readonly startDate: string;
  readonly deadline: string;
}

@Injectable()
export class StartGoalUseCase {
  constructor(
    @Inject(GOALS_REPOSITORY) private readonly goalsRepo: GoalsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({ id, userId, startDate, deadline }: StartGoalInput): Promise<GoalEntity> {
    const goal = await this.queryBus.execute<
      GetGoalByIdQuery,
      ReturnHandlerType<typeof GetGoalByIdHandler>
    >(new GetGoalByIdQuery({ id, userId }));
    if (goal == null) {
      throw new NotFoundException(`Goal: ${id} is not existed`);
    }

    goal
      .start({ startDate: DateVo.create(startDate), deadline: DateVo.create(deadline) })
      .validate();

    const updated = await this.goalsRepo.update(goal);
    if (updated == null) {
      throw new InternalServerErrorException('Error occurred while starting goal');
    }

    return updated;
  }
}
