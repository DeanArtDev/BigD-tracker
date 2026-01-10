import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignTaskToGroupCommand } from './assign-task-to-group.command';
import { AssignTaskToGroupUseCase } from './assign-task-to-group.use-case';

@CommandHandler(AssignTaskToGroupCommand)
export class AssignTaskToGroupHandler implements ICommandHandler<AssignTaskToGroupCommand> {
  constructor(private assignTaskToGroupUseCase: AssignTaskToGroupUseCase) {}

  async execute(command: AssignTaskToGroupCommand): Promise<{ success: boolean }> {
    return await this.assignTaskToGroupUseCase.execute(command);
  }
}
