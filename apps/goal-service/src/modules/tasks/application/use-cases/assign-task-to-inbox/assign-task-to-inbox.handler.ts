import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignTaskToInboxCommand } from './assign-task-to-inbox.command';
import { AssignTaskToInboxUseCase } from './assign-task-to-inbox.use-case';

@CommandHandler(AssignTaskToInboxCommand)
export class AssignTaskToInboxHandler implements ICommandHandler<AssignTaskToInboxCommand> {
  constructor(private assignTaskToInboxUseCase: AssignTaskToInboxUseCase) {}

  async execute(command: AssignTaskToInboxCommand): Promise<{ success: boolean }> {
    return await this.assignTaskToInboxUseCase.execute(command);
  }
}
