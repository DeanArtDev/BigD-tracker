import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnassignTaskFromGroupCommand } from './unassign-task-from-group.command';
import { UnassignTaskFromGroupUseCase } from './unassign-task-from-group.use-case';

@CommandHandler(UnassignTaskFromGroupCommand)
export class UnassignTaskFromGroupHandler implements ICommandHandler<UnassignTaskFromGroupCommand> {
  constructor(private unassignTaskFromGroupUseCase: UnassignTaskFromGroupUseCase) {}

  async execute(command: UnassignTaskFromGroupCommand): Promise<{ success: boolean }> {
    return await this.unassignTaskFromGroupUseCase.execute(command);
  }
}
