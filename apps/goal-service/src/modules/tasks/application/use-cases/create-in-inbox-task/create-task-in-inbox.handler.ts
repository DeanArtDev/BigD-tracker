import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTaskInInboxCommand } from './create-task-in-inbox.command';
import { CreateTaskInInboxUseCase } from './create-task-in-inbox.use-case';

@CommandHandler(CreateTaskInInboxCommand)
export class CreateTaskInInboxHandler implements ICommandHandler<CreateTaskInInboxCommand> {
  constructor(private createTaskUseCase: CreateTaskInInboxUseCase) {}

  async execute({ input }: CreateTaskInInboxCommand): Promise<TaskView> {
    return await this.createTaskUseCase.execute(input);
  }
}
