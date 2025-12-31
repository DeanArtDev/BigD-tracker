import { GetThing } from '@big-d/api-contracts';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { RequestContextPayloadGuard } from '@shared/guards';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class TasksRpcController {
  constructor(
    // private readonly requestContextSrv: RequestContextService,
    private readonly commandBus: CommandBus,
  ) {}

  @MessagePattern(GetThing.pattern)
  async getThings() // @Payload() { data }: GetThing.Request,
  // @RequestContext() rc: RequestContextData,
  : Promise<GetThing.Response> {
    // const context = this.requestContextSrv.create(rc);
    return {
      data: await new Promise((resolve) => resolve([])),
    };
  }
}
