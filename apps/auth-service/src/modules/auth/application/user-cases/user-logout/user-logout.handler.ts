import { RpcStatus } from '@big-d/api-contracts';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserLogoutCommand } from './user-logout.command';
import { UserLogoutUseCase } from './user-logout.use-case';

@CommandHandler(UserLogoutCommand)
export class UserLogoutHandler implements ICommandHandler<UserLogoutCommand> {
  constructor(private userLogoutUseCase: UserLogoutUseCase) {}

  async execute(command: UserLogoutCommand): Promise<{ status: RpcStatus }> {
    return await this.userLogoutUseCase.execute(command);
  }
}
