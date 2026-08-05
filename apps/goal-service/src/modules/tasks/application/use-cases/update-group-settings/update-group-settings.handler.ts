import { GroupSettingsView } from '../../dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateGroupSettingsCommand } from './update-group-settings.command';
import { UpdateGroupSettingsUseCase } from './update-group-settings.use-case';

@CommandHandler(UpdateGroupSettingsCommand)
class UpdateGroupSettingsHandler implements ICommandHandler<UpdateGroupSettingsCommand> {
  constructor(private readonly updateGroupSettingsUseCase: UpdateGroupSettingsUseCase) {}

  execute(command: UpdateGroupSettingsCommand): Promise<GroupSettingsView> {
    return this.updateGroupSettingsUseCase.execute(command);
  }
}

export { UpdateGroupSettingsHandler };
