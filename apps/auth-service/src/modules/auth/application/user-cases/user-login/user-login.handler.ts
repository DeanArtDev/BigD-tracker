import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserLoginCommand } from './user-login.command';
import { UserLoginUseCase } from './user-login.use-case';

@CommandHandler(UserLoginCommand)
export class UserLoginHandler implements ICommandHandler<UserLoginCommand> {
  constructor(private userLoginUseCase: UserLoginUseCase) {}

  async execute(command: UserLoginCommand): Promise<{ accessToken: string; refreshToken: string; maxAge: number }> {
    return await this.userLoginUseCase.execute(command);
  }
}
