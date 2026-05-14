import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDeleteCommand } from './user-delete.command';
import { UserDeleteUseCase } from './user-delete.use-case';

@CommandHandler(UserDeleteCommand)
export class UserDeleteHandler implements ICommandHandler<UserDeleteCommand> {
  constructor(private userDeleteUseCase: UserDeleteUseCase) {}

  async execute(command: UserDeleteCommand): Promise<{ id: number }> {
    return await this.userDeleteUseCase.execute(command);
  }
}
