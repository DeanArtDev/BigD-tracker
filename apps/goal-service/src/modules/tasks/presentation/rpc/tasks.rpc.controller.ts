import { CreateTaskCommand } from '@/modules/tasks/application/use-cases';
import { ReplaceTaskCommand } from '@/modules/tasks/application/use-cases/replace-task';
import { GoalCreateTask, GoalReplaceTask } from '@big-d/api-contracts';
import { Controller, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RequestContextPayloadGuard } from '@shared/request-context';

@Controller()
@UseGuards(RequestContextPayloadGuard)
export class TasksRpcController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern(GoalCreateTask.pattern)
  async createTask(
    @Payload() { data: payload }: GoalCreateTask.Request,
  ): Promise<GoalCreateTask.Response> {
    return {
      data: await this.commandBus.execute(new CreateTaskCommand(payload)),
    };
  }

  @MessagePattern(GoalReplaceTask.pattern)
  async replaceTask(
    @Payload() { data: payload }: GoalReplaceTask.Request,
  ): Promise<GoalReplaceTask.Response> {
    return {
      data: await this.commandBus.execute(new ReplaceTaskCommand(payload)),
    };
  }
}
