import { FinishThingUseCase } from '@/modules/things/application/use-cases';
import { GoalFinishThing } from '@big-d/api-contracts';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class ThingsController {
  constructor(private readonly finishThingUC: FinishThingUseCase) {}

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
}
