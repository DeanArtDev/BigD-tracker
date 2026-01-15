import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteGroupCommand } from './delete-group.command';
import { DeleteGroupUseCase } from './delete-group.use-case';

@CommandHandler(DeleteGroupCommand)
export class DeleteGroupHandler implements ICommandHandler<DeleteGroupCommand> {
  constructor(private deleteGroupUseCase: DeleteGroupUseCase) {}

  async execute(command: DeleteGroupCommand): Promise<{ data: boolean }> {
    return await this.deleteGroupUseCase.execute(command);
  }
}
