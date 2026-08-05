import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTaskSettingsCommand } from './update-task-settings.command';
import { UpdateTaskSettingsResult, UpdateTaskSettingsUseCase } from './update-task-settings.use-case';

@CommandHandler(UpdateTaskSettingsCommand)
class UpdateTaskSettingsHandler implements ICommandHandler<UpdateTaskSettingsCommand> {
  constructor(private readonly updateTaskSettingsUseCase: UpdateTaskSettingsUseCase) {}

  execute(command: UpdateTaskSettingsCommand): Promise<UpdateTaskSettingsResult> {
    return this.updateTaskSettingsUseCase.execute(command);
  }
}

export { UpdateTaskSettingsHandler };
