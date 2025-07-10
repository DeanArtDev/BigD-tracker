import {
  GetAllGoalsByUserIdHandler,
  GetAllGoalsByUserIdQuery,
  GetGoalByIdHandler,
  GetGoalByIdQuery,
} from '@/modules/goals/application/queries';
import { GoalGetGroupById, GoalGetGroupByUserId } from '@big-d/api-contracts';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Controller, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GoalsMapper } from './goals.mapper';

@Controller()
export class GoalsQueryController {
  constructor(
    private readonly mapper: GoalsMapper,
    private readonly queryBus: QueryBus,
  ) {}

  @MessagePattern(GoalGetGroupById.pattern)
  async getById(@Payload() { data }: GoalGetGroupById.Request): Promise<GoalGetGroupById.Response> {
    const goal = await this.queryBus.execute<
      GetGoalByIdQuery,
      ReturnHandlerType<typeof GetGoalByIdHandler>
    >(new GetGoalByIdQuery({ id: data.id, userId: data.userId }));
    if (goal == null) {
      throw new NotFoundException(`Goal: ${data.id} is not found`);
    }
    return { data: this.mapper.fromEntityToDTO(goal) };
  }

  @MessagePattern(GoalGetGroupByUserId.pattern)
  async getByUserId(
    @Payload() { data }: GoalGetGroupByUserId.Request,
  ): Promise<GoalGetGroupByUserId.Response> {
    const goals = await this.queryBus.execute<
      GetAllGoalsByUserIdQuery,
      ReturnHandlerType<typeof GetAllGoalsByUserIdHandler>
    >(new GetAllGoalsByUserIdQuery({ userId: data.userId }));

    return { data: goals.map(this.mapper.fromEntityToDTO) };
  }
}
