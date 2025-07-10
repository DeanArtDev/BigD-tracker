import {
  CreateGoalCommand,
  CreateGoalHandler,
  DeleteGoalCommand,
  UpdateGoalCommand,
  UpdateGoalHandler,
  DeleteGoalHandler,
} from '@/modules/goals/application/commands';
import { GetGoalByIdHandler, GetGoalByIdQuery } from '@/modules/goals/application/queries';
import { FinishGoalUseCase, StartGoalUseCase } from '@/modules/goals/application/use-cases';
import {
  GoalCreateGoal,
  GoalDeleteGoal,
  GoalFinishGoal,
  GoalStartGoal,
  GoalUpdateGoal,
} from '@big-d/api-contracts';
import { ReturnHandlerType } from '@big-d/api-utils';
import { Controller, InternalServerErrorException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GoalsMapper } from './goals.mapper';

@Controller()
export class GoalsCommandController {
  constructor(
    private readonly mapper: GoalsMapper,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly startGoalUC: StartGoalUseCase,
    private readonly finishGoalUC: FinishGoalUseCase,
  ) {}

  @MessagePattern(GoalCreateGoal.pattern)
  async createGoal(@Payload() { data }: GoalCreateGoal.Request): Promise<GoalCreateGoal.Response> {
    const { id } = await this.commandBus.execute<
      CreateGoalCommand,
      ReturnHandlerType<typeof CreateGoalHandler>
    >(new CreateGoalCommand(data));

    const goal = await this.queryBus.execute<
      GetGoalByIdQuery,
      ReturnHandlerType<typeof GetGoalByIdHandler>
    >(new GetGoalByIdQuery({ id, userId: data.userId }));
    if (goal == null) {
      throw new InternalServerErrorException('Error occurred while creating goal');
    }

    return { data: this.mapper.fromEntityToDTO(goal) };
  }

  @MessagePattern(GoalUpdateGoal.pattern)
  async updateGoal(@Payload() { data }: GoalUpdateGoal.Request): Promise<GoalUpdateGoal.Response> {
    const { id } = await this.commandBus.execute<
      UpdateGoalCommand,
      ReturnHandlerType<typeof UpdateGoalHandler>
    >(new UpdateGoalCommand(data));

    const goal = await this.queryBus.execute<
      GetGoalByIdQuery,
      ReturnHandlerType<typeof GetGoalByIdHandler>
    >(new GetGoalByIdQuery({ id, userId: data.userId }));
    if (goal == null) {
      throw new InternalServerErrorException('Error occurred while updating goal');
    }

    return { data: this.mapper.fromEntityToDTO(goal) };
  }

  @MessagePattern(GoalStartGoal.pattern)
  async startGoal(@Payload() { data }: GoalStartGoal.Request): Promise<GoalStartGoal.Response> {
    await this.startGoalUC.execute({
      id: data.id,
      userId: data.userId,
      startDate: data.startDate,
      deadline: data.deadline,
    });
    return { data: true };
  }

  @MessagePattern(GoalFinishGoal.pattern)
  async finishGoal(@Payload() { data }: GoalFinishGoal.Request): Promise<GoalFinishGoal.Response> {
    await this.finishGoalUC.execute({
      id: data.id,
      userId: data.userId,
      endDate: data.endDate,
    });
    return { data: true };
  }

  @MessagePattern(GoalDeleteGoal.pattern)
  async deleteGoal(@Payload() { data }: GoalDeleteGoal.Request): Promise<GoalDeleteGoal.Response> {
    await this.commandBus.execute<DeleteGoalCommand, ReturnHandlerType<typeof DeleteGoalHandler>>(
      new DeleteGoalCommand({
        id: data.id,
        userId: data.userId,
      }),
    );
    return { data: { id: data.id } };
  }
}
