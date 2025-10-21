import { ThingsService } from '@/modules/things/application/things.service';
import { FinishThingUseCase } from '@/modules/things/application/use-cases';
import {
  GoalCreateThing,
  GoalCreateThingIntoInBoxGroup,
  GoalDeleteThing,
  GoalFinishThing,
  GoalUpdateThing,
} from '@big-d/api-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ThingsController {
  constructor(
    private readonly finishThingUC: FinishThingUseCase,
    private readonly thingsService: ThingsService,
  ) {}

  @MessagePattern(GoalFinishThing.pattern)
  async finishThing(
    @Payload() { data }: GoalFinishThing.Request,
  ): Promise<GoalFinishThing.Response> {
    await this.finishThingUC.execute({
      id: data.id,
      userId: data.userId,
      endDate: data.endDate,
      comment: data.comment,
      result: data.result,
    });

    return { data: true };
  }

  @MessagePattern(GoalCreateThingIntoInBoxGroup.pattern)
  async createThingIntoInBox(
    @Payload() { data }: GoalCreateThingIntoInBoxGroup.Request,
  ): Promise<GoalCreateThingIntoInBoxGroup.Response> {
    return {
      data: await this.thingsService.createIntoInBoxGroup({
        userId: data.userId,
        deadline: data.deadline,
        name: data.name,
        description: data.description,
        priority: data.priority,
        startDate: data.startDate,
      }),
    };
  }

  @MessagePattern(GoalCreateThing.pattern)
  async createThing(
    @Payload() { data }: GoalCreateThing.Request,
  ): Promise<GoalCreateThing.Response> {
    return {
      data: await this.thingsService.createThing({
        groupId: data.groupId,
        userId: data.userId,
        deadline: data.deadline,
        name: data.name,
        description: data.description,
        priority: data.priority,
        startDate: data.startDate,
      }),
    };
  }

  @MessagePattern(GoalUpdateThing.pattern)
  async updateThing(
    @Payload() { data }: GoalUpdateThing.Request,
  ): Promise<GoalUpdateThing.Response> {
    return {
      data: await this.thingsService.updateThing({
        id: data.id,
        userId: data.userId,
        deadline: data.deadline,
        name: data.name,
        description: data.description,
        priority: data.priority,
        startDate: data.startDate,
      }),
    };
  }

  @MessagePattern(GoalDeleteThing.pattern)
  async deleteThing(
    @Payload() { data }: GoalDeleteThing.Request,
  ): Promise<GoalDeleteThing.Response> {
    await this.thingsService.delete({ id: data.id, userId: data.userId });

    return { data: { id: data.id } };
  }
}
