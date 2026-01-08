import { TaskView } from '@/modules/tasks/application/dto/task.view';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateInboxTaskCommand } from './update-inbox-task.command';
import { UpdateInboxTaskUseCase } from './update-inbox-task.use-case';

@CommandHandler(UpdateInboxTaskCommand)
export class UpdateInboxTaskHandler implements ICommandHandler<UpdateInboxTaskCommand> {
  constructor(private updateInboxTaskUseCase: UpdateInboxTaskUseCase) {}

  async execute(command: UpdateInboxTaskCommand): Promise<TaskView> {
    return await this.updateInboxTaskUseCase.execute(command);
  }
}
