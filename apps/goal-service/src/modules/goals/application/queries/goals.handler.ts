import { GOALS_REPOSITORY, GoalsRepository } from '@/modules/goals/application';
import { GoalEntity } from '@/modules/goals/domain';
import {
  GetGroupByGoalIdHandler,
  GetGroupByGoalIdQuery,
} from '@/modules/groups/application/queries';
import {
  GetThingsByGroupIdHandler,
  GetThingsByGroupIdQuery,
} from '@/modules/things/application/queries';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GetAllGoalsByUserIdQuery, GetGoalByIdQuery } from './goals.query';

@QueryHandler(GetGoalByIdQuery)
export class GetGoalByIdHandler implements IQueryHandler<GetGoalByIdQuery> {
  constructor(
    @Inject(GOALS_REPOSITORY) private readonly goalsRepo: GoalsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({ input }: GetGoalByIdQuery): Promise<GoalEntity | null> {
    const goal = await this.goalsRepo.findById(input);
    if (goal == null) return null;

    const groups = await this.queryBus.execute<
      GetGroupByGoalIdQuery,
      ReturnHandlerType<typeof GetGroupByGoalIdHandler>
    >(new GetGroupByGoalIdQuery({ goalId: goal.id, userId: input.userId }));

    for (const group of groups) {
      const things = await this.queryBus.execute<
        GetThingsByGroupIdQuery,
        ReturnHandlerType<typeof GetThingsByGroupIdHandler>
      >(new GetThingsByGroupIdQuery({ groupId: group.id, userId: input.userId }));
      group.setThings(things);
    }

    return goal.setGroups(groups);
  }
}

@QueryHandler(GetAllGoalsByUserIdQuery)
export class GetAllGoalsByUserIdHandler implements IQueryHandler<GetAllGoalsByUserIdQuery> {
  constructor(
    @Inject(GOALS_REPOSITORY) private readonly goalsRepo: GoalsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute({ input }: GetAllGoalsByUserIdQuery): Promise<GoalEntity[]> {
    const goals = await this.goalsRepo.findAllByUserId(input);

    for (const goal of goals) {
      const groups = await this.queryBus.execute<
        GetGroupByGoalIdQuery,
        ReturnHandlerType<typeof GetGroupByGoalIdHandler>
      >(new GetGroupByGoalIdQuery({ goalId: goal.id, userId: input.userId }));

      for (const group of groups) {
        const things = await this.queryBus.execute<
          GetThingsByGroupIdQuery,
          ReturnHandlerType<typeof GetThingsByGroupIdHandler>
        >(new GetThingsByGroupIdQuery({ groupId: group.id, userId: input.userId }));
        group.setThings(things);
      }
      goal.setGroups(groups);
    }

    return goals;
  }
}
