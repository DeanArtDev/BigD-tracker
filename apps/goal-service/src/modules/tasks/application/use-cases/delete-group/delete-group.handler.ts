import { GroupView } from '@/modules/tasks/application/dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteGroupCommand } from './delete-group.command';
import { DeleteGroupUseCase } from './delete-group.use-case';

@CommandHandler(DeleteGroupCommand)
export class DeleteGroupHandler implements ICommandHandler<DeleteGroupCommand> {
  constructor(private deleteGroupUseCase: DeleteGroupUseCase) {}

  async execute(command: DeleteGroupCommand): Promise<GroupView> {
    return await this.deleteGroupUseCase.execute(command);
  }
}
