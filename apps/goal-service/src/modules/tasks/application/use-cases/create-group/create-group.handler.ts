import { GroupView } from '@/modules/tasks/application/dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateGroupCommand } from './create-group.command';
import { CreateGroupUseCase } from './create-group.use-case';

@CommandHandler(CreateGroupCommand)
export class CreateGroupHandler implements ICommandHandler<CreateGroupCommand> {
  constructor(private createGroupUseCase: CreateGroupUseCase) {}

  async execute(command: CreateGroupCommand): Promise<GroupView> {
    return await this.createGroupUseCase.execute(command);
  }
}
