import { GroupInboxView } from '@/modules/tasks/application/dto/group-inbox.view';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateInboxGroupCommand } from './create-inbox-group.command';
import { CreateInboxGroupUseCase } from './create-inbox-group.use-case';

@CommandHandler(CreateInboxGroupCommand)
export class CreateInboxGroupHandler implements ICommandHandler<CreateInboxGroupCommand> {
  constructor(private createTaskUseCase: CreateInboxGroupUseCase) {}

  async execute({ input }: CreateInboxGroupCommand): Promise<GroupInboxView> {
    return await this.createTaskUseCase.execute(input);
  }
}
