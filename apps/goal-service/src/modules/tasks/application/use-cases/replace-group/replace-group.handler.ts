import { GroupView } from '@/modules/tasks/application/dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReplaceGroupCommand } from './replace-group.command';
import { ReplaceGroupUseCase } from './replace-group.use-case';

@CommandHandler(ReplaceGroupCommand)
export class ReplaceGroupHandler implements ICommandHandler<ReplaceGroupCommand> {
  constructor(private replaceGroupUseCase: ReplaceGroupUseCase) {}

  async execute(command: ReplaceGroupCommand): Promise<GroupView> {
    return await this.replaceGroupUseCase.execute(command);
  }
}
