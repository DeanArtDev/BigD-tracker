import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserTokenRefreshCommand } from './user-token-refresh.command';
import { UserTokenRefreshUseCase } from './user-token-refresh.use-case';

@CommandHandler(UserTokenRefreshCommand)
export class UserTokenRefreshHandler implements ICommandHandler<UserTokenRefreshCommand> {
  constructor(private userTokenRefreshUseCase: UserTokenRefreshUseCase) {}

  async execute(command: UserTokenRefreshCommand): Promise<{ accessToken: string; maxAge: number }> {
    return await this.userTokenRefreshUseCase.execute(command);
  }
}
